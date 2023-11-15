import TransactionApiService from '@api-services/TransactionApiService';
import VestingContractApiService from '@api-services/VestingContractApiService';
import { injected } from '@connectors/index';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useOrganization } from '@store/useOrganizations';
import { TIME_FACTORY_CONTRACTS } from '@utils/constants';
import { getParamFromEvent } from '@utils/web3';
import { useWeb3React } from '@web3-react/core';
import { IStatus, STATUS_MAPPING } from 'components/organisms/DashboardPendingActions';
import MILESTONE_FACTORY_ABI from 'contracts/abi/MilestoneFactory.json';
import TIME_FACTORY_ABI from 'contracts/abi/TimeFactory.json';
import VTVL_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import { ethers } from 'ethers';
import { IVestingContract } from 'interfaces/vestingContract';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { VTVLVesting__factory } from 'typechain/factories/VTVLVesting__factory';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

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
  const { currentSafe } = useAuthContext();
  const { organizationId } = useOrganization();
  const { safeTransactions, setSafeTransactions } = useDashboardContext();
  const {
    setTransactionStatus: setTransactionLoaderStatus,
    setIsCloseAvailable,
    transactions
  } = useTransactionLoaderContext();
  const { mintFormState } = useTokenContext();
  const { updateVestingContract } = useDashboardContext();

  const transaction = useMemo(
    () => transactions.find((t) => t.id === data.transaction && t.status === 'PENDING'),
    [data, transactions]
  );

  const [transactionStatus, setTransactionStatus] = useState<
    'INITIALIZE' | 'EXECUTABLE' | 'WAITING_APPROVAL' | 'APPROVAL_REQUIRED' | '' | 'DEPLOYED'
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

          const factoryContractInterface = new ethers.utils.Interface(TIME_FACTORY_ABI.abi);
          const createVestingContractEncoded = factoryContractInterface.encodeFunctionData('createVestingContract', [
            mintFormState.address,
            0
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
            to: TIME_FACTORY_CONTRACTS[chainId],
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
          const transaction = await TransactionApiService.createTransaction({
            hash: '',
            safeHash: txHash,
            status: 'PENDING',
            to: TIME_FACTORY_CONTRACTS[chainId],
            type: 'VESTING_DEPLOYMENT',
            organizationId: organizationId,
            chainId,
            vestingContractId: id,
            vestingIds: []
          });
          await VestingContractApiService.updateVestingContract(id, {
            ...data,
            status: 'PENDING',
            transaction: transaction.id
          });
          toast.success(`Created a safe transaction with nonce ${nextNonce} successfully`);
          setTransactionLoaderStatus('SUCCESS');
        } else {
          const factoryContract = new ethers.Contract(
            TIME_FACTORY_CONTRACTS[chainId],
            TIME_FACTORY_ABI.abi,
            library.getSigner()
          );

          setTransactionLoaderStatus('IN_PROGRESS');
          const vestingContractTx = await (
            await factoryContract.createVestingContract(mintFormState.address, 0)
          ).wait();
          const factoryInterface = new ethers.utils.Interface(TIME_FACTORY_ABI.abi);
          const vestingContractAddress = getParamFromEvent(
            factoryInterface,
            vestingContractTx,
            'CreateVestingContract(address,address)',
            0
          );
          const newData = { ...data };
          delete newData.token;
          await VestingContractApiService.updateVestingContract(id, {
            ...newData,
            tokenId: mintFormState.id,
            address: ethers.utils.getAddress(vestingContractAddress),
            status: 'SUCCESS',
            isDeployed: true
          });
          await updateVestingContract({ ...data, address: vestingContractAddress, status: 'SUCCESS' });

          setTransactionLoaderStatus('SUCCESS');
        }

        setTransactionStatus('DEPLOYED');
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

        const approveTxResponse = await safeSdk.approveTransactionHash(transaction?.safeHash as string);
        setTransactionLoaderStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(
          transaction?.safeHash as string
        );

        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        setSafeTransactions({ ...safeTransactions, [transaction.hash]: safeTx });
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
          transaction?.safeHash as string
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
        setSafeTransactions({ ...safeTransactions, [transaction.hash]: safeTx });
        const factoryInterface = new ethers.utils.Interface(TIME_FACTORY_ABI.abi);
        const vestingContractAddress = getParamFromEvent(
          factoryInterface,
          vestingContractTx,
          'CreateVestingContract(address,address)',
          0
        );
        await TransactionApiService.updateTransaction(transaction.id, { ...transaction, status: 'SUCCESS' });
        await updateVestingContract({ ...data, address: vestingContractAddress, status: 'SUCCESS' });
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

  const handleTransferOwnership = async () => {
    try {
      setIsCloseAvailable(false);
      if (organizationId && chainId) {
        setTransactionLoaderStatus('PENDING');

        const vestingContract = new ethers.Contract(data.address ?? '', VTVL_VESTING_ABI.abi, library.getSigner());
        const transactionResponse = await vestingContract.setAdmin(currentSafe?.address, true);
        setTransactionLoaderStatus('IN_PROGRESS');
        await transactionResponse.wait();
        setStatus('REMOVE_ORIGINAL_OWNERSHIP');
        setTransactionLoaderStatus('SUCCESS');
        // fetchDashboardVestingContract();
      }
    } catch (err) {
      console.log('handleTransferOwnership - ', err);
      setTransactionLoaderStatus('ERROR');
    }
  };

  const handleRemoveDeployerOwnership = async () => {
    try {
      setIsCloseAvailable(false);
      if (!account || !library || !chainId) {
        activate(injected);
        return;
      }

      if (
        organizationId &&
        currentSafe &&
        currentSafe.address &&
        currentSafe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())
      ) {
        setTransactionLoaderStatus('PENDING');
        const vestingContract = new ethers.Contract(data.address ?? '', VTVL_VESTING_ABI.abi, library.getSigner());
        const transactionResponse = await vestingContract.setAdmin(account, false);
        setTransactionLoaderStatus('IN_PROGRESS');
        await transactionResponse.wait();
        const res = await VestingContractApiService.updateVestingContract(id, {
          address: vestingContract.address,
          chainId,
          status: 'SUCCESS',
          organizationId
        });
        updateVestingContract(res);
        setStatus('SUCCESS');
        setTransactionLoaderStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleTransferOwnership - ', err);
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

    if (transaction && transaction.safeHash && currentSafe && account) {
      const safeTx = safeTransactions[transaction.safeHash]
        ? safeTransactions[transaction.safeHash]
        : await fetchSafeTransactionFromHash(transaction.safeHash);
      if (safeTx) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
        const threshold = await safeSdk.getThreshold();
        const approvers: string[] = [];
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
          setStatus(transaction.type === 'FUNDING_CONTRACT' ? 'FUNDING_REQUIRED' : 'AUTHORIZATION_REQUIRED');
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
      <div className="flex items-center w-4 lg:w-16 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
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
        {currentSafe ? (
          <div className="flex gap-1.5 items-center">
            <img className="w-4 h-4" src="icons/safe_wallet.svg" />
            {currentSafe?.safe_name}&nbsp;{currentSafe?.address.slice(0, 4)}...{currentSafe?.address.slice(-4)}
          </div>
        ) : (
          'N/A'
        )}
      </div>
      <div className="flex items-center w-32 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center w-40 py-3 flex-shrink-0 border-t border-[#d0d5dd]"></div>
      <div className="flex items-center min-w-[205px] flex-grow py-3 pr-3 flex-shrink-0 justify-stretch border-t border-[#d0d5dd] bg-gradient-to-l from-white via-white to-transparent  sticky right-0">
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
          ) : transactionStatus === 'DEPLOYED' ? (
            <></>
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
