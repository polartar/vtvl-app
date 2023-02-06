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
import { updateRevoking } from 'services/db/revoking';
import { createTransaction, updateTransaction } from 'services/db/transaction';
import { fetchVestingsByQuery, updateVesting } from 'services/db/vesting';
import { fetchVestingContractsByQuery, updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRevoking, ITransaction, IVesting, IVestingContract } from 'types/models';
import { formatNumber, parseTokenAmount } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getNumberOfReleases,
  getReleaseFrequencyTimestamp
} from 'utils/vesting';

const PendingRevokingAction: React.FC<{ id: string; data: IRevoking }> = ({ id, data }) => {
  const { account, chainId, activate, library } = useWeb3React();
  const { safe, organizationId } = useAuthContext();
  const {
    // fetchDashboardVestingContract,
    vestingContracts,
    transactions,
    fetchDashboardTransactions,
    vestings,
    fetchDashboardData
  } = useDashboardContext();
  const { setTransactionStatus: setTransactionLoaderStatus, setIsCloseAvailable } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();

  const transaction = useMemo(
    () => transactions.find((t) => t.id === data.transactionId && t.data.status === 'PENDING'),
    [data, transactions]
  );
  const vesting = useMemo(() => vestings.find((v) => v.id === data.vestingId), [vestings, data]);
  const recipient = useMemo(
    () => vesting?.data.recipients.find((r) => r.walletAddress.toLowerCase() === data.recipient.toLowerCase()),
    [data, vesting]
  );
  const vestingContract = useMemo(
    () => vestingContracts.find((v) => v.id === vesting?.data.vestingContractId),
    [vesting, vestingContracts]
  );

  const [status, setStatus] = useState<IStatus>();
  const [transactionStatus, setTransactionStatus] = useState<ITransactionStatus>('');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (safe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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
    if (transaction && transaction.data.safeHash && safe && account) {
      const safeTx = await fetchSafeTransactionFromHash(transaction.data.safeHash);
      if (safeTx) {
        setSafeTransaction(safeTx);
        if (safeTx.signatures.size >= safe?.threshold) {
          setTransactionStatus('EXECUTABLE');
          setStatus('AUTHORIZATION_REQUIRED');
        } else if (safeTx.signatures.has(account.toLowerCase())) {
          setTransactionStatus('WAITING_APPROVAL');
          setStatus('AUTHORIZATION_REQUIRED');
        } else {
          setTransactionStatus('APPROVAL_REQUIRED');
          setStatus('AUTHORIZATION_REQUIRED');
        }
      }
    }
  };

  const handleExecuteFundingTransaction = async () => {
    try {
      if (safe?.address && chainId && safeTransaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.data.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionLoaderStatus('IN_PROGRESS');
        await executeTransactionResponse.transactionResponse?.wait();
        if (transaction?.data) {
          await updateTransaction(
            {
              ...transaction.data,
              status: 'SUCCESS'
            },
            data.transactionId
          );
        }
        // setStatus('AUTHORIZATION_REQUIRED');
        // setTransactionStatus('INITIALIZE');
        toast.success('Funded successfully.');
        await fetchDashboardData();
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleExecuteFundingTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleApproveTransaction = async () => {
    try {
      setIsCloseAvailable(false);

      if (safe?.address && chainId && transaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({
          ethAdapter: ethAdapter,
          safeAddress: safe?.address
        });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.data?.hash as string
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
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.data?.hash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        setSafeTransaction(await fetchSafeTransactionFromHash(transaction?.data?.hash as string));
        await fetchDashboardData();
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
      if (safe?.address && chainId && transaction) {
        setTransactionLoaderStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
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
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.data.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionLoaderStatus('IN_PROGRESS');
        await executeTransactionResponse.transactionResponse?.wait();
        if (transaction.data) {
          await updateTransaction(
            {
              ...transaction.data,
              status: 'SUCCESS'
            },
            data.transactionId
          );
          await updateRevoking(
            {
              ...data,
              status: 'SUCCESS'
            },
            id
          );
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

  useEffect(() => {
    initializeStatus();
  }, [data, safe, account, transactions, transaction]);
  console.log({ transactionStatus });
  return (
    <div className="flex bg-white text-[#667085] text-xs border-t border-[#d0d5dd]">
      <div className="flex items-center w-16 py-3"></div>
      <div className="flex items-center w-36 py-3">{recipient?.name}</div>
      <div className="flex items-center w-52 py-3">Revoke Schedule</div>
      <div className="flex items-center w-52 py-3">
        {status && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs whitespace-nowrap">
            <WarningIcon className="w-3 h-3" />
            {STATUS_MAPPING[status]}
          </div>
        )}
      </div>
      <div className="flex items-center w-40 py-3">{vestingContract?.data.name}</div>
      <div className="flex items-center w-32 py-3">
        <div className="flex gap-1.5 items-center">
          <img className="w-4 h-4" src="icons/safe.png" />
          Founders
        </div>
      </div>
      <div className="flex items-center w-40 py-3"></div>
      <div className="flex items-center min-w-[200px] flex-grow py-3">
        {transactionStatus === 'WAITING_APPROVAL' && (
          <button className="danger small whitespace-nowrap" disabled>
            Waiting approval
          </button>
        )}
        {transactionStatus === 'APPROVAL_REQUIRED' && (
          <button className="danger small whitespace-nowrap" onClick={handleApproveTransaction}>
            Approve
          </button>
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