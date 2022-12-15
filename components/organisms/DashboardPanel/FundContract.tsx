import Copy from '@components/atoms/Copy/Copy';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import Chip from 'components/atoms/Chip/Chip';
import StepWizard from 'components/atoms/StepWizard/StepWizard';
import ContractOverview from 'components/molecules/ContractOverview/ContractOverview';
import ScheduleOverview from 'components/molecules/ScheduleOverview/ScheduleOverview';
import { injected } from 'connectors';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { useAuthContext } from 'providers/auth.context';
import { useTokenContext } from 'providers/token.context';
import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchOrgByQuery } from 'services/db/organization';
import {
  createTransaction,
  fetchTransaction,
  fetchTransactionByQuery,
  fetchTransactionsByQuery,
  updateTransaction
} from 'services/db/transaction';
import { updateVesting } from 'services/db/vesting';
import { createVestingContract, fetchVestingContract, fetchVestingContractByQuery } from 'services/db/vestingContract';
import { DATE_FREQ_TO_TIMESTAMP } from 'types/constants/schedule-configuration';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction } from 'types/models';
import { IScheduleOverviewProps, IVesting, IVestingContractProps } from 'types/models/vesting';
import { formatNumber, parseTokenAmount } from 'utils/token';
import { getCliffAmount, getCliffDateTime, getNumberOfReleases } from 'utils/vesting';

import FundingContractModal from '../FundingContractModal/FundingContractModal';

interface IFundContractStatuses {
  icon: string | JSX.Element | React.ReactNode;
  label: string;
  actions?: JSX.Element | React.ReactNode;
}

const FundContract = () => {
  // Color is not included in the statuses object because of typescript -- converts the value into a type string which will not be accepted by Chip

  const { account, library, activate, chainId } = useWeb3React();
  const { safe, organizationId } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const { transactionStatus, setTransactionStatus } = useTransactionLoaderContext();
  const {
    vestings,
    transactions,
    vestingContract,
    ownershipTransfered,
    fetchDashboardVestingContract,
    fetchDashboardVestings,
    fetchDashboardTransactions,
    setOwnershipTransfered,
    depositAmount,
    insufficientBalance,
    fetchVestingContractBalance
  } = useDashboardContext();

  const [activeVestingIndex, setActiveVestingIndex] = useState(0);
  const [status, setStatus] = useState('fundingRequired');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [transaction, setTransaction] = useState<{ id: string; data: ITransaction } | undefined>();
  const [approved, setApproved] = useState(false);
  const [executable, setExecutable] = useState(false);
  const [showFundingContractModal, setShowFundingContractModal] = useState(false);

  const handleCreateSignTransaction = () => {};

  const handleExecuteTransaction = async () => {
    try {
      if (safe?.address && chainId && transaction) {
        setTransactionStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(transaction.data.hash);
        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        setTransactionStatus('IN_PROGRESS');
        await executeTransactionResponse.transactionResponse?.wait();

        updateTransaction(
          {
            ...transaction.data,
            status: 'SUCCESS'
          },
          transaction.id
        );
        toast.success('Executed successfully.');
        setTransactionStatus('SUCCESS');
        setStatus('success');
        fetchVestingContractBalance();
      }
    } catch (err) {
      console.log('handleExecuteTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionStatus('ERROR');
    }
  };

  const handleApproveTransaction = async () => {
    try {
      if (safe?.address && chainId && transaction) {
        setTransactionStatus('PENDING');
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });
        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(transaction.data.hash);
        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction.data.hash);
        setTransactionStatus('IN_PROGRESS');
        await approveTxResponse.transactionResponse?.wait();
        fetchSafeTransactionFromHash(transaction.data.hash);
        setApproved(true);
        toast.success('Approved successfully.');
        setTransactionStatus('SUCCESS');
      }
    } catch (err) {
      console.log('handleApproveTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
      setTransactionStatus('ERROR');
    }
  };

  const handleFundContract = async (type: string, amount: string) => {
    try {
      if (!account || !chainId) {
        // activate(injected);
        toast.info('Connect your wallet and try again.');
        return;
      }

      if (type === 'Metamask') {
        setTransactionStatus('PENDING');
        const tokenContract = new ethers.Contract(
          mintFormState.address,
          [
            // Read-Only Functions
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)',
            // Authenticated Functions
            'function transfer(address to, uint amount) returns (bool)',
            // Events
            'event Transfer(address indexed from, address indexed to, uint amount)'
          ],
          library.getSigner()
        );
        const fundTransaction = await tokenContract.transfer(
          vestingContract?.data?.address,
          ethers.utils.parseEther(amount)
        );
        setTransactionStatus('IN_PROGRESS');
        await fundTransaction.wait();
        toast.success('Token deposited successfully');
        setStatus('success');
        fetchVestingContractBalance();
        setTransactionStatus('SUCCESS');
      } else {
        const tokenContractInterface = new ethers.utils.Interface([
          'function transfer(address to, uint amount) returns (bool)',
          // Events
          'event Transfer(address indexed from, address indexed to, uint amount)'
        ]);
        const transferEncoded = tokenContractInterface.encodeFunctionData('transfer', [
          vestingContract?.data?.address,
          ethers.utils.parseEther(amount)
        ]);
        if (safe?.address && account && chainId && organizationId) {
          if (safe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())) {
            setTransactionStatus('PENDING');
            const ethAdapter = new EthersAdapter({
              ethers: ethers,
              signer: library?.getSigner(0)
            });
            const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
            const txData = {
              to: mintFormState.address,
              data: transferEncoded,
              value: '0'
            };
            const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
            const txHash = await safeSdk.getTransactionHash(safeTransaction);
            const signature = await safeSdk.signTransactionHash(txHash);
            setTransactionStatus('IN_PROGRESS');
            safeTransaction.addSignature(signature);
            const safeService = new SafeServiceClient({
              txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
              ethAdapter
            });
            await safeService.proposeTransaction({
              safeAddress: safe.address,
              senderAddress: account,
              safeTransactionData: safeTransaction.data,
              safeTxHash: txHash,
              senderSignature: signature.data
            });
            const transactionId = await createTransaction({
              hash: txHash,
              safeHash: '',
              status: 'PENDING',
              to: vestingContract?.data?.address ?? '',
              type: 'FUNDING_CONTRACT',
              createdAt: Math.floor(new Date().getTime() / 1000),
              updatedAt: Math.floor(new Date().getTime() / 1000),
              organizationId: organizationId,
              chainId
            });
            setApproved(true);
            setTransaction({
              id: transactionId,
              data: {
                hash: txHash,
                safeHash: '',
                status: 'PENDING',
                to: vestingContract?.data?.address ?? '',
                type: 'FUNDING_CONTRACT',
                createdAt: Math.floor(new Date().getTime() / 1000),
                updatedAt: Math.floor(new Date().getTime() / 1000),
                organizationId: organizationId,
                chainId
              }
            });
            fetchSafeTransactionFromHash(txHash);
            setTransactionStatus('SUCCESS');
          } else {
            toast.error('You are not a signer of this multisig wallet.');
            return;
          }
        }
      }
      setShowFundingContractModal(false);
    } catch (err: any) {
      toast.error(err.reason ? err.reason : 'Something went wrong. Try again later.');
      setTransactionStatus('ERROR');
    }
  };

  const statuses: Record<string, IFundContractStatuses> = {
    createSignTransaction: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Authorization required',
      actions: (
        <>
          <button
            disabled={approved || !vestingContract?.id || !ownershipTransfered}
            className="secondary"
            onClick={handleCreateSignTransaction}>
            {approved ? 'Approved' : 'Create and Sign the transaction'}
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    authRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Authorization required',
      actions: (
        <>
          <button
            disabled={approved && !executable}
            className="secondary"
            onClick={executable ? handleExecuteTransaction : handleApproveTransaction}>
            {executable ? 'Execute' : 'Sign and authorize'}
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    fundingRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding required',
      actions: (
        <>
          <button className="secondary" onClick={() => setShowFundingContractModal(true)}>
            Fund contract
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    fundingInProgress: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding in progress',
      actions: (
        <>
          <button className="primary" disabled>
            Funding contract pending
          </button>
          <button className="line primary" onClick={() => {}}>
            View details
          </button>
        </>
      )
    },
    approved: {
      icon: <SuccessIcon className="w-4 h-4" />,
      label: 'Approved'
    },
    declined: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Declined'
    },
    success: {
      icon: <SuccessIcon className="w-4 h-4" />,
      label: 'Success'
    }
  };

  const steps = [
    { title: '', desc: '' },
    { title: '', desc: '' },
    { title: '', desc: '' }
  ];

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
      setSafeTransaction({ ...safeTx });
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchTransactionsByQuery('organizationId', '==', organizationId).then((res) => {
        setTransaction(
          res.find(
            (transaction) => transaction.data.status === 'PENDING' && transaction.data.type === 'FUNDING_CONTRACT'
          )
        );
      });
    }
  }, [organizationId]);

  useEffect(() => {
    if (transaction) {
      fetchSafeTransactionFromHash(transaction.data.hash);
    }
  }, [transaction]);

  useEffect(() => {
    if (account && safeTransaction && safe) {
      setApproved(safeTransaction.signatures.has(account.toLowerCase()));
      if (safeTransaction.signatures.size === safe?.owners.length) {
        setExecutable(true);
      }
      setStatus('authRequired');
    }
  }, [safeTransaction, account, safe]);

  return insufficientBalance ? (
    <div className={`panel mb-5`}>
      <div className="row-center justify-between border-b border-gray-200 mb-3 pb-3">
        {insufficientBalance ? (
          <Chip
            label={
              <p className="row-center">
                {statuses.fundingRequired.icon}
                {statuses.fundingRequired.label}
              </p>
            }
            color={'warning'}
            rounded
          />
        ) : status ? (
          <Chip
            label={
              <p className="row-center">
                {statuses[status].icon}
                {statuses[status].label}
              </p>
            }
            color={status === 'approved' ? 'success' : status === 'declined' ? 'danger' : 'warning'}
            rounded
          />
        ) : null}
        {status === 'authRequired' || status === 'fundingInProgress' ? (
          <div className="row-center gap-1 paragraphy-small-medium text-neutral-500">
            <div>
              Confirmation status <span className="text-secondary-900">{safeTransaction?.signatures.size}</span>/
              {safe?.owners.length}
            </div>
            <StepWizard
              status={safeTransaction?.signatures.size ?? 0}
              steps={new Array(safe?.owners.length).fill({ title: '', desc: '' })}
              size="tiny"
            />
          </div>
        ) : null}
      </div>
      <div>
        <div className="flex gap-3">
          <div>
            <label>
              <span>Contract Address</span>
            </label>
            <Copy text={vestingContract?.data?.address || ''}>
              <p className="paragraphy-tiny-medium neutral-text">{vestingContract?.data?.address}</p>
            </Copy>
          </div>
          <div>
            <label>
              <span>Amount needed</span>
            </label>
            <p className="paragraphy-tiny-medium neutral-text">{formatNumber(+depositAmount)}</p>
          </div>
        </div>
      </div>
      <div className="border-t mt-3 pt-3 row-center justify-between">
        <div className="row-center">{status ? statuses[status].actions : ''}</div>
      </div>
      <FundingContractModal
        isOpen={showFundingContractModal}
        handleFundContract={handleFundContract}
        hideModal={() => setShowFundingContractModal(false)}
        depositAmount={depositAmount}
      />
    </div>
  ) : null;
};

export default FundContract;
