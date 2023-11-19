import RevokingApiService from '@api-services/RevokingApiService';
import TransactionApiService from '@api-services/TransactionApiService';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { IStatus, ITransactionStatus, STATUS_MAPPING } from 'components/organisms/DashboardPendingActions';
import { ethers } from 'ethers';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

const PendingRevokingAction: React.FC<{ id: string; data: IRevoking }> = ({ id, data }) => {
  const { account, chainId, library } = useWeb3React();
  const { currentSafe, organizationId } = useAuthContext();
  const { vestingContracts, vestings, recipients, fetchDashboardData } = useDashboardContext();
  const {
    setTransactionStatus: setTransactionLoaderStatus,
    setIsCloseAvailable,
    transactions,
    updateTransactions
  } = useTransactionLoaderContext();

  const transaction = useMemo(
    () => transactions.find((t) => t.id === data.transactionId && t.status === 'PENDING'),
    [data, transactions]
  );
  const vesting = useMemo(() => vestings.find((v) => v.id === data.vestingId), [vestings, data]);
  const recipient = useMemo(() => recipients.find((r) => r.id === data.recipeId), [data, recipients]);
  const vestingContract = useMemo(
    () => vestingContracts.find((v) => v.id === vesting?.data.vestingContractId),
    [vesting, vestingContracts]
  );

  const [status, setStatus] = useState<IStatus>();
  const [transactionStatus, setTransactionStatus] = useState<ITransactionStatus>('');
  const [isExecutableAfterApprove, setIsExecutableAfterApprove] = useState(false);
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const safeService = new SafeServiceClient({
        txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
        ethAdapter
      });
      const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(txHash);
      const safeTx = await safeSdk.createTransaction({
        safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
      });
      apiTx.confirmations?.forEach((confirmation) => {
        safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
      });
      return safeTx;
    }
  };

  const initializeStatus = async () => {
    if (transaction && transaction.safeHash && currentSafe && account) {
      const safeTx = await fetchSafeTransactionFromHash(transaction.safeHash);
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });
      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const threshold = await safeSdk.getThreshold();
      if (safeTx) {
        setSafeTransaction(safeTx);
        const approvers: string[] = [];
        safeTx.signatures.forEach((signature) => {
          if (!approvers.find((approver) => approver === signature.signer)) {
            approvers.push(signature.signer);
          }
        });
        if (approvers.length >= threshold) {
          setTransactionStatus('EXECUTABLE');
          setStatus('AUTHORIZATION_REQUIRED');
          setIsExecutableAfterApprove(false);
        } else if (
          safeTx.signatures.has(account.toLowerCase()) ||
          approvers.find((approver) => approver.toLowerCase() === account.toLowerCase())
        ) {
          setTransactionStatus('WAITING_APPROVAL');
          setStatus('AUTHORIZATION_REQUIRED');
        } else {
          setTransactionStatus('APPROVAL_REQUIRED');
          setStatus('AUTHORIZATION_REQUIRED');
          if (approvers.length === threshold - 1) {
            setIsExecutableAfterApprove(true);
          }
        }
      }
    }
  };

  const handleApproveTransaction = async () => {
    try {
      setIsCloseAvailable(false);

      if (currentSafe?.address && chainId && transaction && account) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({
          ethAdapter: ethAdapter,
          safeAddress: currentSafe?.address
        });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: {
            ...apiTx,
            data: apiTx.data || '0x',
            gasPrice: parseInt(apiTx.gasPrice)
          }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.safeHash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        setSafeTransaction(await fetchSafeTransactionFromHash(transaction?.safeHash as string));
        // const t = await TransactionApiService.updateTransaction(id, {
        //   approvers: transaction.approvers ? [...transaction.approvers, account] : [account]
        // });
        // updateTransactions(t);
        toast.success('Approved successfully.');
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleApproveTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleExecuteTransaction = async () => {
    try {
      setIsCloseAvailable(false);
      if (currentSafe?.address && chainId && transaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.data.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const currentNonce = await safeSdk.getNonce();
        if (currentNonce !== apiTx.nonce) {
          toast.error('You have pending transactions that should be executed first.');
          setTransactionLoaderStatus('ERROR');
          return;
        }
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionLoaderStatus('IN_PROGRESS');
        await executeTransactionResponse.transactionResponse?.wait();
        if (transaction) {
          const t = await TransactionApiService.updateTransaction(data.transactionId, {
            organizationId,
            status: 'SUCCESS'
          });
          updateTransactions(t);
          await RevokingApiService.updateRevoking(id, {
            status: 'SUCCESS'
          });
          await fetchDashboardData();
        }
        setTransactionLoaderStatus('SUCCESS');
        setTransactionStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleExecuteTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleApproveAndExecuteTransaction = async () => {
    await handleApproveTransaction();
    await handleExecuteTransaction();
  };

  useEffect(() => {
    initializeStatus();
  }, [data, currentSafe, account, transactions, transaction]);

  return (
    <div className="flex bg-white text-[#667085] text-xs">
      <div className="flex items-center w-4 lg:w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-36 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{recipient?.name}</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">Revoke Schedule</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {status && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap">
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{vestingContract?.name}</div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {currentSafe ? (
          <div className="flex gap-1.5 items-center">
            <img className="w-4 h-4" src="icons/safe_wallet.svg" />
            {currentSafe?.safe_name}&nbsp;{currentSafe?.address.slice(0, 4)}...{currentSafe?.address.slice(-4)}
          </div>
        ) : (
          'N/A'
        )}
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        <div className="flex gap-1.5 items-center">{safeTransaction?.data.nonce}</div>
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center min-w-[350px] flex-grow py-3 pr-3 flex-shrink-0 justify-stretch border-t border-[#d0d5dd]  bg-gradient-to-l from-white via-white to-transparent sticky right-0">
        {transactionStatus === 'WAITING_APPROVAL' && (
          <button className="danger small whitespace-nowrap" disabled>
            Waiting approval
          </button>
        )}
        {transactionStatus === 'APPROVAL_REQUIRED' && (
          <div className="flex gap-4">
            <button className="secondary small whitespace-nowrap" onClick={handleApproveTransaction}>
              Approve
            </button>
            {isExecutableAfterApprove && (
              <button className="secondary small whitespace-nowrap" onClick={handleExecuteTransaction}>
                Approve & Execute
              </button>
            )}
          </div>
        )}
        {transactionStatus === 'EXECUTABLE' && (
          <button className="danger small whitespace-nowrap" onClick={handleExecuteTransaction}>
            Execute
          </button>
        )}
      </div>
    </div>
  );
};

export default PendingRevokingAction;
