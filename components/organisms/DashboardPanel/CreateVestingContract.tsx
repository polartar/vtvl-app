import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useDashboardContext } from '@providers/dashboard.context';
import { useWeb3React } from '@web3-react/core';
import Chip from 'components/atoms/Chip/Chip';
import StepWizard from 'components/atoms/StepWizard/StepWizard';
import ContractOverview from 'components/molecules/ContractOverview/ContractOverview';
import FundContract from 'components/molecules/FundCotract/FundContract';
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
import { createTransaction, fetchTransaction, updateTransaction } from 'services/db/transaction';
import { updateVesting } from 'services/db/vesting';
import { createVestingContract, fetchVestingContract, fetchVestingContractByQuery } from 'services/db/vestingContract';
import { DATE_FREQ_TO_TIMESTAMP } from 'types/constants/schedule-configuration';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction } from 'types/models';
import { IScheduleOverviewProps, IVesting, IVestingContractProps } from 'types/models/vesting';
import { parseTokenAmount } from 'utils/token';
import { getCliffAmount, getCliffDateTime, getNumberOfReleases, getProjectedEndDateTime } from 'utils/vesting';

interface AddVestingSchedulesProps {
  className?: string;
  // status:
  //   | 'authRequired'
  //   | 'vestingContractRequired'
  //   | 'transferToMultisigSafe'
  //   | 'fundingRequired'
  //   | 'fundingInProgress'
  //   | 'approved'
  //   | 'declined';
  // schedule?: IScheduleOverviewProps;
  // contract?: IVestingContractProps;
  // step?: number;
  // className?: string;
  // onPrimaryClick?: () => void;
  // onSecondaryClick?: () => void;
  type: string;
}

interface AddVestingSchedulesPagination {
  total: number;
  page: number;
  onPrevious: () => void;
  onNext: () => void;
}

interface AddVestingSchedulesStatuses {
  icon: string | JSX.Element | React.ReactNode;
  label: string;
  actions?: JSX.Element | React.ReactNode;
}

/**
 * Dashboard Panel component caters two types of item
 * 1. Contract - displays an overview details of the contract
 * 2. Schedule - displays an overview details of the schedule
 * Each type display different heading portion (status) and actions (buttons)
 *
 * Statuses:
 * - authRequired - has confirmation steps - based on number of approvals
 * - vestingContractRequired
 * - transferToMultisigSafe
 * - fundingRequired
 * - fundingInProgress - has confirmation steps - based on number of approvals
 * - approved
 * - declined
 *
 * onPrimaryClick - is an event when triggering the primary CTA for the panel
 * onSecondaryClick - is an event when triggering the secondary CTA -- normally "View details" etc.
 *
 */

const AddVestingSchedules = ({
  className = '',
  type
}: // status,
// schedule,
// contract,
// className,
// step = 0,
// onPrimaryClick = () => {},
// onSecondaryClick = () => {},
// ...props
AddVestingSchedulesProps) => {
  // Color is not included in the statuses object because of typescript -- converts the value into a type string which will not be accepted by Chip

  const { account, library, activate, chainId } = useWeb3React();
  const { safe, organizationId } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const {
    vestings,
    transactions,
    vestingContract,
    ownershipTransfered,
    fetchDashboardVestingContract,
    fetchDashboardVestings,
    fetchDashboardTransactions,
    setOwnershipTransfered,
    depositAmount
  } = useDashboardContext();

  const [activeVestingIndex, setActiveVestingIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [transaction, setTransaction] = useState<ITransaction | undefined>();
  const [approved, setApproved] = useState(false);
  const [executable, setExecutable] = useState(false);

  // const totalVestingAmount = useMemo(() => {
  //   let result = 0;
  //   vestings
  //     .filter((vesting) => vesting.data.status !== 'SUCCESS')
  //     .forEach((vesting) => (result += parseFloat(vesting.data.details.amountToBeVested as unknown as string)));
  //   return result;
  // }, [vestings]);
  // console.log({ totalVestingAmount, vestings });
  const handleDeployVestingContract = async () => {
    console.log('handleDeployVestingContract');
    if (!account) {
      activate(injected);
      return;
    } else if (organizationId) {
      const VestingFactory = new ethers.ContractFactory(
        VTVL_VESTING_ABI.abi,
        '0x' + VTVL_VESTING_ABI.bytecode,
        library.getSigner()
      );
      const vestingContract = await VestingFactory.deploy(mintFormState.address);
      await vestingContract.deployed();
      const vestingContractId = await createVestingContract({
        address: vestingContract.address,
        status: 'SUCCESS',
        deployer: account,
        organizationId,
        createdAt: Math.floor(new Date().getTime() / 1000),
        updatedAt: Math.floor(new Date().getTime() / 1000)
      });
      fetchDashboardVestingContract();
      setStatus('transferToMultisigSafe');
    }
  };

  const handleTransferOwnership = async () => {
    if (organizationId) {
      const vestingContractData = await fetchVestingContractByQuery('organizationId', '==', organizationId);
      if (vestingContractData?.data) {
        const vestingContract = new ethers.Contract(
          vestingContractData?.data?.address,
          VTVL_VESTING_ABI.abi,
          library.getSigner()
        );
        await vestingContract.setAdmin(safe?.address, true);
        setStatus('success');
        setOwnershipTransfered(true);
      }
    }
  };

  const handleCreateSignTransaction = async () => {
    try {
      if (!account || !library) {
        activate(injected);
        return;
      }
      const vesting = vestings[activeVestingIndex].data;
      const vestingId = vestings[activeVestingIndex].id;
      const cliffAmountPerUser =
        getCliffAmount(
          vesting.details.cliffDuration,
          +vesting.details.lumpSumReleaseAfterCliff,
          +vesting.details.amountToBeVested
        ) / vesting.recipients.length;
      const vestingAmountPerUser = +vesting.details.amountToBeVested / vesting.recipients.length - cliffAmountPerUser;
      const addresses = vesting.recipients.map((recipient) => recipient.walletAddress);
      const cliffReleaseDate = vesting.details.startDateTime
        ? getCliffDateTime(
            new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()),
            vesting.details.cliffDuration
          )
        : '';
      const cliffReleaseTimestamp = cliffReleaseDate ? Math.floor(cliffReleaseDate.getTime() / 1000) : 0;
      const numberOfReleases =
        vesting.details.startDateTime && vesting.details.endDateTime
          ? getNumberOfReleases(
              vesting.details.releaseFrequency,
              cliffReleaseDate || new Date((vesting.details.startDateTime as unknown as Timestamp).toMillis()),
              new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis())
            )
          : 0;
      const actualStartDateTime =
        vesting.details.cliffDuration !== 'no-cliff' ? cliffReleaseDate : vesting.details.startDateTime;
      const vestingEndTimestamp =
        vesting.details.endDateTime && actualStartDateTime
          ? getProjectedEndDateTime(
              actualStartDateTime,
              new Date((vesting.details.endDateTime as unknown as Timestamp).toMillis()),
              numberOfReleases,
              DATE_FREQ_TO_TIMESTAMP[vesting.details.releaseFrequency]
            )
          : null;
      const vestingStartTimestamps = new Array(vesting.recipients.length).fill(
        cliffReleaseTimestamp
          ? cliffReleaseTimestamp
          : Math.floor((vesting.details.startDateTime as unknown as Timestamp).seconds)
      );
      const vestingEndTimestamps = new Array(vesting.recipients.length).fill(
        Math.floor(vestingEndTimestamp!.getTime() / 1000)
      );
      const vestingCliffTimestamps = new Array(vesting.recipients.length).fill(cliffReleaseTimestamp);
      const vestingReleaseIntervals = new Array(vesting.recipients.length).fill(
        DATE_FREQ_TO_TIMESTAMP[vesting.details.releaseFrequency]
      );
      const vestingLinearVestAmounts = new Array(vesting.recipients.length).fill(
        parseTokenAmount(vestingAmountPerUser, 18)
      );
      const vestingCliffAmounts = new Array(vesting.recipients.length).fill(parseTokenAmount(cliffAmountPerUser, 18));

      console.log({
        addresses,
        vestingStartTimestamps,
        vestingEndTimestamps,
        vestingCliffTimestamps,
        vestingReleaseIntervals,
        vestingLinearVestAmounts,
        vestingCliffAmounts
      });

      const CREATE_CLAIMS_BATCH_FUNCTION =
        'function createClaimsBatch(address[] memory _recipients, uint40[] memory _startTimestamps, uint40[] memory _endTimestamps, uint40[] memory _cliffReleaseTimestamps, uint40[] memory _releaseIntervalsSecs, uint112[] memory _linearVestAmounts, uint112[] memory _cliffAmounts)';
      const CREATE_CLAIMS_BATCH_INTERFACE =
        'createClaimsBatch(address[],uint40[],uint40[],uint40[],uint40[],uint112[],uint112[])';
      const ABI = [CREATE_CLAIMS_BATCH_FUNCTION];
      const vestingContractInterface = new ethers.utils.Interface(ABI);
      const createClaimsBatchEncoded = vestingContractInterface.encodeFunctionData('createClaimsBatch', [
        addresses,
        vestingStartTimestamps,
        vestingEndTimestamps,
        vestingCliffTimestamps,
        vestingReleaseIntervals,
        vestingLinearVestAmounts,
        vestingCliffAmounts
      ]);

      if (safe?.address && account && chainId && organizationId) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const vestingContract = await fetchVestingContractByQuery('organizationId', '==', organizationId);
        const txData = {
          to: vestingContract?.data?.address ?? '',
          data: createClaimsBatchEncoded,
          value: '0'
        };
        console.log({ txData });
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
        const txHash = await safeSdk.getTransactionHash(safeTransaction);
        const signature = await safeSdk.signTransactionHash(txHash);
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
        console.log({ txHash });
        if (account && organizationId) {
          const vestingContract = await fetchVestingContractByQuery('organizationId', '==', organizationId);
          const transactionId = await createTransaction({
            hash: txHash,
            safeHash: '',
            status: 'PENDING',
            to: vestingContract?.data?.address ?? '',
            type: 'ADDING_CLAIMS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            organizationId: organizationId
          });
          setTransaction({
            hash: txHash,
            safeHash: '',
            status: 'PENDING',
            to: vestingContract?.data?.address ?? '',
            type: 'ADDING_CLAIMS',
            createdAt: Math.floor(new Date().getTime() / 1000),
            updatedAt: Math.floor(new Date().getTime() / 1000),
            organizationId: organizationId
          });
          updateVesting(
            {
              ...vesting,
              transactionId
            },
            vestingId
          );
          setApproved(true);
        }
        toast.success('Transaction has been created successfully.');
      }
    } catch (err) {
      console.log('handleCreateSignTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
    }
  };

  const handleApproveTransaction = async () => {
    try {
      console.log('handleApproveTransaction');
      if (safe?.address && chainId && transaction) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(transaction?.hash);
        console.log({ apiTx });
        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        const approveTxResponse = await safeSdk.approveTransactionHash(transaction.hash);
        await approveTxResponse.transactionResponse?.wait();
        fetchSafeTransactionFromHash(transaction.hash);
        setApproved(true);
        toast.success('Approved successfully.');
        // const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        // await executeTransactionResponse.transactionResponse?.wait();
      }
    } catch (err) {
      console.log('handleApproveTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
    }
  };

  const handleExecuteTransaction = async () => {
    try {
      if (safe?.address && chainId && transaction) {
        const ethAdapter = new EthersAdapter({
          ethers: ethers,
          signer: library?.getSigner(0)
        });

        const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: safe?.address });
        const safeService = new SafeServiceClient({
          txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
          ethAdapter
        });
        const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(transaction?.hash);
        console.log({ apiTx });
        const safeTx = await safeSdk.createTransaction({
          safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
        });
        apiTx.confirmations?.forEach((confirmation) => {
          safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
        });
        console.log({ safeTx });
        // const approveTxResponse = await safeSdk.approveTransactionHash(transaction.hash);
        // console.log({ safeTx });
        // await approveTxResponse.transactionResponse?.wait();
        const executeTransactionResponse = await safeSdk.executeTransaction(safeTx);
        await executeTransactionResponse.transactionResponse?.wait();

        updateTransaction(
          {
            ...transaction,
            status: 'SUCCESS'
          },
          vestings[activeVestingIndex].data.transactionId
        );
        toast.success('Executed successfully.');
      }
    } catch (err) {
      console.log('handleExecuteTransaction - ', err);
      toast.error('Something went wrong. Try again later.');
    }
  };

  const handleCreateFundTransaction = async () => {};

  const statuses: Record<string, AddVestingSchedulesStatuses> = {
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
            disabled={(approved && !executable) || insufficientBalance}
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
    vestingContractRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Vesting contract required',
      actions: (
        <>
          <button className="secondary" onClick={handleDeployVestingContract}>
            Create vesting contract
          </button>
        </>
      )
    },
    transferToMultisigSafe: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Transfer Ownership to Multisig',
      actions: (
        <>
          <button className="line primary" disabled onClick={() => {}}>
            Create vesting contract
          </button>
          <button className="black row-center" onClick={handleTransferOwnership}>
            <img src="/images/multi-sig.png" className="w-6 h-6" aria-hidden="true" />
            Transfer ownership to Multi-sig Safe
          </button>
        </>
      )
    },
    fundingRequired: {
      icon: <WarningIcon className="w-4 h-4" />,
      label: 'Funding required',
      actions: (
        <>
          <button className="secondary" onClick={() => {}}>
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
      console.log({ apiTx });
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
    if (vestings && vestings.length > 0 && type !== 'fundContract') {
      const vesting = vestings[activeVestingIndex].data;
      if (vesting && vesting.transactionId) {
        fetchTransaction(vesting.transactionId).then((res) => setTransaction(res));
      } else if (!vesting.transactionId) {
        setTransaction(undefined);
        setSafeTransaction(undefined);
        setApproved(false);
        setExecutable(false);
        setStatus('createSignTransaction');
      }
    }
  }, [vestings, activeVestingIndex, type]);

  useEffect(() => {
    if (transaction?.hash) {
      fetchSafeTransactionFromHash(transaction.hash);
    }
  }, [transaction, account]);

  useEffect(() => {
    if (type === 'contract' && !vestingContract?.id) {
      setStatus('vestingContractRequired');
    } else if (type === 'contract' && vestingContract?.id) {
      setStatus('transferToMultisigSafe');
    } else if (type === 'fundContract') {
      setStatus('fundingRequired');
    }
  }, [type, vestingContract, ownershipTransfered]);

  return (
    <div className={`panel ${className} mb-5`}>
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
        {type === 'schedule' && vestings && vestings.length > 0 ? (
          vestings[activeVestingIndex].data ? (
            <ScheduleOverview {...vestings[activeVestingIndex].data} />
          ) : null
        ) : null}
        {/* {type === 'fundContract' && (
          <FundContract address={vestingContract?.data?.address || ''} amount={depositAmount} />
        )} */}
        {type === 'contract' ? (
          <ContractOverview
            tokenName={mintFormState.name}
            tokenSymbol={mintFormState.symbol}
            supplyCap={mintFormState.supplyCap}
            maxSupply={mintFormState.maxSupply ? mintFormState.maxSupply : 0}
            address={mintFormState.address}
          />
        ) : null}
      </div>
      <div className="border-t mt-3 pt-3 row-center justify-between">
        <div className="row-center">{status ? statuses[status].actions : ''}</div>
        {vestings && vestings.length > 0 && type !== 'fundingRequired' && (
          <div className="row-center text-sm font-medium">
            <button
              className="primary py-2 text-sm font-medium"
              disabled={activeVestingIndex === 0}
              onClick={() => {
                setActiveVestingIndex(activeVestingIndex - 1);
              }}>
              Previous
            </button>
            <span>
              {activeVestingIndex + 1} of {vestings.length}
            </span>
            <button
              className="primary py-2 text-sm font-medium"
              disabled={activeVestingIndex === vestings.length - 1}
              onClick={() => setActiveVestingIndex(activeVestingIndex + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVestingSchedules;