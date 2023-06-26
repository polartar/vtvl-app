import { injected } from '@connectors/index';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { IStatus, STATUS_MAPPING } from 'components/organisms/DashboardPendingActions';
import VTVL_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import FACTORY_ABI from 'contracts/abi/factory.json';
import { ethers } from 'ethers';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVestingContract } from 'types/models';
import { CREATE_VESTING_CONTRACT_ABI, FACTORY_CONTRACTS } from 'utils/constants';
import { getParamFromEvent } from 'utils/web3';

interface IVestingContractPendingActionProps {
  id: string;
  data: IVestingContract;
  filter: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  };
  updateFilter: (v: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  }) => void;
}

const VestingContractPendingAction: React.FC<IVestingContractPendingActionProps> = ({
  id,
  data,
  filter,
  updateFilter
}) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { currentSafe, organizationId } = useAuthContext();
  const { safeTransactions, setSafeTransactions } = useDashboardContext();
  const {
    setTransactionStatus: setTransactionLoaderStatus,
    setIsCloseAvailable,
    transactions
  } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();

  const transaction = useMemo(
    () => transactions.find((t) => t.id === data.transactionId && t.data.status === 'PENDING'),
    [data, transactions]
  );

  const [transactionStatus, setTransactionStatus] = useState<
    'INITIALIZE' | 'EXECUTABLE' | 'WAITING_APPROVAL' | 'APPROVAL_REQUIRED' | ''
  >('');
  const [status, setStatus] = useState<IStatus>('');

  const shouldShow =
    filter.status === 'ALL' ||
    (filter.status === 'FUND' && status === 'FUNDING_REQUIRED') ||
    (filter.status === 'TRANSFER_OWNERSHIP' &&
      (status === 'REMOVE_ORIGINAL_OWNERSHIP' || status === 'TRANSFER_OWNERSHIP'));

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId && txHash) {
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
      setSafeTransactions({ ...safeTransactions, [txHash]: safeTx });
      return safeTx;
    }
  };

  const handleDeployVestingContract = async () => {
    setIsCloseAvailable(false);
    try {
      if (!account || !chainId) {
        activate(injected);
        return;
      } else if (organizationId) {
        if (currentSafe) {
          setTransactionLoaderStatus('PENDING');
          const factoryContractInterface = new ethers.utils.Interface(FACTORY_ABI);
          const createVestingContractEncoded = factoryContractInterface.encodeFunctionData('createVestingContract', [
            mintFormState.address
          ]);

          const ethAdapter = new EthersAdapter({
            ethers: ethers,
            signer: library?.getSigner(0)
          });
          setTransactionLoaderStatus('PENDING');
          const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
          const safeService = new SafeServiceClient({
            txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
            ethAdapter
          });
          const nextNonce = await safeService.getNextNonce(currentSafe.address);
          const txData = {
            to: FACTORY_CONTRACTS[chainId],
            data: createVestingContractEncoded,
            value: '0',
            nonce: nextNonce
          };
          const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
          const txHash = await safeSdk.getTransactionHash(safeTransaction);
          const signature = await safeSdk.signTransactionHash(txHash);
          setTransactionLoaderStatus('IN_PROGRESS');
          safeTransaction.addSignature(signature);
          setSafeTransactions({ ...safeTransactions, [txHash]: safeTransaction });
          await safeService.proposeTransaction({
            safeAddress: currentSafe.address,
            senderAddress: account,
            safeTransactionData: safeTransaction.data,
            safeTxHash: txHash,
            senderSignature: signature.data
          });
          const transactionId = await createTransaction({
            hash: '',
            safeHash: txHash,
            status: 'PENDING',
            to: '',
            type: 'VESTING_DEPLOYMENT',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            organizationId: organizationId,
            chainId,
            approvers: [account]
          });
          await updateVestingContract({ ...data, status: 'PENDING', transactionId }, id);
          toast.success(`Created a safe transaction with nonce ${nextNonce} successfully`);
          setTransactionLoaderStatus('SUCCESS');
        } else {
          const factoryContract = new ethers.Contract(FACTORY_CONTRACTS[chainId], FACTORY_ABI, library.getSigner());
          setTransactionLoaderStatus('IN_PROGRESS');
          const vestingContractTx = await (await factoryContract.createVestingContract(mintFormState.address)).wait();
          const factoryInterface = new ethers.utils.Interface(FACTORY_ABI);
          const vestingContractAddress = getParamFromEvent(
            factoryInterface,
            vestingContractTx,
            'CreateVestingContract(address,address)',
            0
          );
          await updateVestingContract(
            {
              ...data,
              tokenAddress: mintFormState.address,
              address: vestingContractAddress,
              status: 'SUCCESS',
              deployer: account,
              updatedAt: Math.floor(new Date().getTime() / 1000)
            },
            id
          );
          setTransactionLoaderStatus('SUCCESS');
        }
      }
    } catch (err) {
      console.log('handleDeployVestingContract - ', err);
      setTransactionLoaderStatus('ERROR');
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

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });

        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.data?.safeHash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.data?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        setSafeTransactions({ ...safeTransactions, [transaction.data.hash]: safeTx });
        await updateTransaction(
          {
            ...transaction.data,
            approvers: transaction.data.approvers ? [...transaction.data.approvers, account] : [account]
          },
          transaction.id
        );
        toast.success('Approved successfully.');
        const threshold = await safeSdk.getThreshold();
        if (safeTx.signatures.size >= threshold) {
          setStatus('EXECUTABLE');
          setTransactionStatus('EXECUTABLE');
        } else {
          setStatus('AUTHORIZATION_REQUIRED');
          setTransactionStatus('WAITING_APPROVAL');
        }
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleApproveTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleExecuteTransaction = async () => {
    setIsCloseAvailable(false);
    try {
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
          transaction?.data?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });

        const currentNonce = await safeSdk.getNonce();
        if (currentNonce !== apiTx.nonce) {
          toast.error('You have pending transactions that should be executed first.');
          setTransactionLoaderStatus('ERROR');
          return;
        }
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionLoaderStatus('IN_PROGRESS');
        const vestingContractTx = await executeTransactionResponse.transactionResponse?.wait();
        setTransactionLoaderStatus('IN_PROGRESS');
        setSafeTransactions({ ...safeTransactions, [transaction.data.hash]: safeTx });
        const factoryInterface = new ethers.utils.Interface(FACTORY_ABI);
        const vestingContractAddress = getParamFromEvent(
          factoryInterface,
          vestingContractTx,
          'CreateVestingContract(address,address)',
          0
        );
        await updateTransaction({ ...transaction.data, status: 'SUCCESS' }, transaction.id);
        await updateVestingContract({ ...data, address: vestingContractAddress, status: 'SUCCESS' }, id);
        setTransactionLoaderStatus('SUCCESS');
        toast.success('Deployed a contract successfully.');
        setStatus('SUCCESS');
        setTransactionStatus('');
      }
    } catch (err) {
      console.log('handleExecuteTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const initializeStatus = async () => {
    if (data.status === 'INITIALIZED') {
      setStatus('AUTHORIZATION_REQUIRED');
      if (currentSafe?.address) {
        setTransactionStatus('INITIALIZE');
      } else {
        setTransactionStatus('');
      }
      return;
    }

    if (transaction && transaction.data.safeHash && currentSafe && account) {
      const safeTx = safeTransactions[transaction.data.safeHash]
        ? safeTransactions[transaction.data.safeHash]
        : await fetchSafeTransactionFromHash(transaction.data.safeHash);
      if (safeTx) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const threshold = await safeSdk.getThreshold();
        const approvers = transaction.data.approvers ? [...transaction.data.approvers] : [];
        safeTx.signatures.forEach((signature) => {
          if (!approvers.find((approver) => approver === signature.signer)) {
            approvers.push(signature.signer);
          }
        });
        if (approvers.length >= threshold) {
          setStatus('EXECUTABLE');
          setTransactionStatus('EXECUTABLE');
        } else if (safeTx.signatures.has(account.toLowerCase()) || approvers.find((approver) => approver === account)) {
          setStatus('AUTHORIZATION_REQUIRED');
          setTransactionStatus('WAITING_APPROVAL');
        } else {
          setStatus(transaction.data.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
          setTransactionStatus('APPROVAL_REQUIRED');
        }
      } else {
        return;
      }
    }
  };

  useEffect(() => {
    initializeStatus();
  }, [data, currentSafe, transaction, safeTransactions]);

  return status === 'SUCCESS' ? null : shouldShow ? (
    <div className="flex bg-white text-[#667085] text-xs">
      <div className="flex items-center w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-36 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{data.name}</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">Contract Deployment</div>
      <div className="flex items-center w-52 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {!!status && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap"
            onClick={() => {
              updateFilter({
                ...filter,
                status:
                  status === 'TRANSFER_OWNERSHIP' || status === 'REMOVE_ORIGINAL_OWNERSHIP'
                    ? 'TRANSFER_OWNERSHIP'
                    : status === 'AUTHORIZATION_REQUIRED'
                    ? 'DEPLOY_VESTING_CONTRACT'
                    : 'ALL'
              });
            }}>
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]">{data.name}</div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        <div className="flex gap-1.5 items-center">
          <img className="w-4 h-4" src="icons/safe.png" />
          Founders
        </div>
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center min-w-[200px] flex-grow py-3 flex-shrink-0 border-t border-[#d0d5dd]">
        {status === 'AUTHORIZATION_REQUIRED' ? (
          transactionStatus === 'WAITING_APPROVAL' ? (
            <button className="secondary small" disabled>
              Approved
            </button>
          ) : transactionStatus === 'APPROVAL_REQUIRED' ? (
            <button className="secondary small" onClick={handleApproveTransaction}>
              Approve
            </button>
          ) : transactionStatus === 'INITIALIZE' ? (
            <button className="secondary small" onClick={handleDeployVestingContract}>
              Deploy
            </button>
          ) : (
            <button className="secondary small" onClick={handleDeployVestingContract}>
              Deploy
            </button>
          )
        ) : status === 'EXECUTABLE' ? (
          <button className="secondary small" onClick={handleExecuteTransaction}>
            Execute
          </button>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default VestingContractPendingAction;
