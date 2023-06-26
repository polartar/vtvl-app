import { injected } from '@connectors/index';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import {
  IStatus,
  ITransactionStatus,
  STATUS_MAPPING,
  TRANSACTION_STATUS_MAPPING
} from 'components/organisms/DashboardPendingActions';
import FundingContractModalV2 from 'components/organisms/FundingContractModal/FundingContractModalV2';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRevoking, ITransaction, IVesting, IVestingContract } from 'types/models';
import { formatNumber } from 'utils/token';

const PendingAdminWithdrawAction: React.FC<{ id: string; data: ITransaction }> = ({ id, data }) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { currentSafe, organizationId } = useAuthContext();
  const {
    // fetchDashboardVestingContract,
    vestingContracts,
    fetchDashboardData
  } = useDashboardContext();
  const { setTransactionStatus: setTransactionLoaderStatus, setIsCloseAvailable } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();

  const vestingContract = useMemo(
    () => vestingContracts.find((v) => v.id === data.vestingContractId),
    [data, vestingContracts]
  );

  const [status, setStatus] = useState<IStatus>();
  const [transactionStatus, setTransactionStatus] = useState<ITransactionStatus>('');
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
    if (data && data.safeHash && currentSafe && account) {
      const safeTx = await fetchSafeTransactionFromHash(data.safeHash);
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });
      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const threshold = await safeSdk.getThreshold();
      if (safeTx) {
        setSafeTransaction(safeTx);
        const approvers = data.approvers ? [...data.approvers] : [];
        safeTx.signatures.forEach((signature) => {
          if (!approvers.find((approver) => approver === signature.signer)) {
            approvers.push(signature.signer);
          }
        });
        if (approvers.length >= threshold) {
          setTransactionStatus('EXECUTABLE');
          setStatus('EXECUTABLE');
        } else if (safeTx.signatures.has(account.toLowerCase()) || approvers.find((approver) => approver === account)) {
          setTransactionStatus('WAITING_APPROVAL');
          setStatus('AUTHORIZATION_REQUIRED');
        } else {
          setTransactionStatus('APPROVAL_REQUIRED');
          setStatus('AUTHORIZATION_REQUIRED');
        }
      }
    }
  };

  const handleApproveTransaction = async () => {
    try {
      setIsCloseAvailable(false);

      if (currentSafe?.address && chainId && data && account) {
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
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(data?.safeHash as string);

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
        const approveTxResponse = await safeSdk.approveTransactionHash(data?.safeHash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        setSafeTransaction(await fetchSafeTransactionFromHash(data?.safeHash as string));
        await updateTransaction(
          {
            ...data,
            approvers: data.approvers ? [...data.approvers, account] : [account]
          },
          id
        );
        setTransactionStatus('WAITING_APPROVAL');
        setStatus('AUTHORIZATION_REQUIRED');
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
      if (currentSafe?.address && chainId && data) {
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
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(data?.safeHash as string);

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
        if (data) {
          await updateTransaction(
            {
              ...data,
              status: 'SUCCESS'
            },
            id
          );
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

  useEffect(() => {
    initializeStatus();
  }, [data, currentSafe, account]);

  return transactionStatus !== 'SUCCESS' ? (
    <div className="flex bg-white text-[#667085] text-xs">
      <div className="flex items-center w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-36 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {vestingContract?.data.name}
      </div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">Admin Withdraw</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {status && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap">
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {vestingContract?.data.name}
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        <div className="flex gap-1.5 items-center">
          <img className="w-4 h-4" src="icons/safe.png" />
          Founders
        </div>
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        <div className="flex gap-1.5 items-center">{safeTransaction?.data.nonce}</div>
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {formatNumber(+(data.withdrawAmount ?? 0))}
      </div>
      <div className="flex items-center min-w-[200px] flex-grow py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {transactionStatus === 'WAITING_APPROVAL' && (
          <button className="secondary small whitespace-nowrap" disabled>
            Waiting approval
          </button>
        )}
        {transactionStatus === 'APPROVAL_REQUIRED' && (
          <button className="secondary small whitespace-nowrap" onClick={handleApproveTransaction}>
            Approve
          </button>
        )}
        {transactionStatus === 'EXECUTABLE' && (
          <button className="secondary small whitespace-nowrap" onClick={handleExecuteTransaction}>
            Execute
          </button>
        )}
      </div>
    </div>
  ) : null;
};

export default PendingAdminWithdrawAction;
