import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import Loader from '@components/atoms/Loader/Loader';
import StepWizard from '@components/atoms/StepWizard/StepWizard';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import ScheduleSummary from '@components/molecules/ScheduleSummary/ScheduleSummary';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import VestingScheduleProfile from '@components/organisms/VestingSchedule/VestingScheduleProfile';
import VestingFilter from '@components/organisms/VestingSchedule/Vestings';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import Decimal from 'decimal.js';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import { IStatus } from 'interfaces/vesting';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import WarningIcon from 'public/icons/warning.svg';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { fetchRecipientsByQuery } from 'services/db/recipient';
import { fetchTransaction } from 'services/db/transaction';
import { fetchVesting } from 'services/db/vesting';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipientDoc, ITransaction, IVesting } from 'types/models';
import { getActualDateTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { getDuration } from 'utils/vesting';

const VestingScheduleDetailed: NextPageWithLayout = () => {
  const router = useRouter();
  const { scheduleId } = router.query;
  const { account, library, chainId } = useWeb3React();
  const { vestings: allVestings, vestingContracts: allVestingContracts } = useDashboardContext();
  const { mintFormState } = useTokenContext();
  const { safe, organizationId } = useAuthContext();
  const { loading, hideLoading, showLoading } = useLoaderContext();

  const [filter, setFilter] = useState<{
    keyword: string;
    status: IStatus;
  }>({ keyword: '', status: IStatus.ALL });
  const [recipients, setRecipients] = useState<IRecipientDoc[]>([]);
  const [vestingSchedule, setVestingSchedule] = useState<IVesting | undefined>(undefined);

  const vesting = useMemo(() => {
    return allVestings.find((vesting) => vesting.id === scheduleId);
  }, [allVestings, scheduleId]);
  const vestingContracts = useMemo(() => {
    const selectedVestingContract = allVestingContracts?.find(
      (contract) => contract.id === vesting?.data?.vestingContractId
    );
    return selectedVestingContract ? [selectedVestingContract] : [];
  }, [allVestingContracts, vesting]);
  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(
    vestingContracts,
    vesting ? [vesting] : [],
    recipients
  );

  const vestingScheduleDetails = useMemo(() => {
    if (!vestingSchedulesInfo || !vestingSchedulesInfo.length || !vestingContracts.length) return undefined;
    let allocation = ethers.BigNumber.from(0),
      unclaimed = ethers.BigNumber.from(0),
      withdrawn = ethers.BigNumber.from(0),
      locked = ethers.BigNumber.from(0);
    vestingSchedulesInfo.forEach((vesting) => {
      allocation = allocation.add(vesting.allocation);
      unclaimed = unclaimed.add(vesting.unclaimed);
      withdrawn = withdrawn.add(vesting.withdrawn);
      locked = locked.add(vesting.locked);
    });
    return {
      address: vestingSchedulesInfo[0].address,
      recipient: '',
      allocation: allocation,
      unclaimed: unclaimed,
      withdrawn: withdrawn,
      locked: locked,
      reserved: vestingSchedulesInfo.length
        ? ethers.BigNumber.from(vestingContracts[0]?.data.balance || '0').sub(
            vestingSchedulesInfo[0].numTokensReservedForVesting || '0'
          )
        : ethers.BigNumber.from(0)
    };
  }, [vestingSchedulesInfo, vestingContracts]);

  console.log({ vestingScheduleDetails });

  const getVestingScheduleDetails = async () => {
    console.log('fetching schedule', scheduleId);
    // Get the schedule details
    try {
      const getVestingSchedule = await fetchVesting(scheduleId as string);
      const recipientsData = await fetchRecipientsByQuery(['vestingId'], ['=='], [scheduleId]);
      setRecipients(recipientsData);
      console.log('Vesting Schedule UI', getVestingSchedule);
      if (getVestingSchedule) {
        const actualDateTime = getActualDateTime(getVestingSchedule.details);
        setVestingSchedule({
          ...getVestingSchedule,
          details: {
            ...getVestingSchedule?.details,
            startDateTime: actualDateTime.startDateTime,
            endDateTime: actualDateTime.endDateTime
          }
        });
        hideLoading();
      }
    } catch (err) {
      // something went wrong
      hideLoading();
    }
  };

  useEffect(() => {
    if (scheduleId) {
      showLoading();
      getVestingScheduleDetails();
    }
  }, [scheduleId]);

  const scheduleDuration =
    vestingSchedule && vestingSchedule.details.startDateTime && vestingSchedule.details.endDateTime
      ? getDuration(vestingSchedule.details.startDateTime as Date, vestingSchedule.details.endDateTime)
      : '';

  const approvers = new Array(safe?.threshold).fill({ title: '', desc: '' });
  const [transaction, setTransaction] = useState<{ id: string; data: ITransaction | undefined }>();
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  // Copy of the one from AddVestingSchedule.tsx
  // To do Arvin: Optimize this along with the existing one
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

  // Fetch the transaction by using the transaction id
  // With this, we can check whether the vesting schedule has multisig transactions
  useEffect(() => {
    if (vestingSchedule?.transactionId) {
      fetchTransaction(vestingSchedule.transactionId).then((res) => {
        setTransaction({ id: vestingSchedule.transactionId, data: res });
      });
    }
  }, [vestingSchedule]);

  // Actually fetch the Safe transaction
  useEffect(() => {
    if (transaction?.data?.hash) {
      fetchSafeTransactionFromHash(transaction.data.hash);
    }
  }, [transaction, account]);

  return (
    <>
      {!loading && vesting ? (
        <div className="w-full text-left">
          <div className="flex items-center gap-3 text-3xl font-bold">
            {vesting.data.name}
            {vesting.data.status === 'LIVE' && <Chip color="successAlt" label="Active" />}
          </div>
          <TokenProfile {...mintFormState} className="mb-2" />
          {vestingScheduleDetails && vesting && (
            <VestingScheduleProfile
              vestingScheduleInfo={vestingScheduleDetails}
              count={recipients.length}
              title="Recipients"
              vesting={vesting.data}
            />
          )}
          <VestingFilter
            filter={filter}
            vestings={[vesting]}
            vestingSchedulesInfo={vestingSchedulesInfo}
            totalBalance={vestingContracts[0].data.balance || '0'}
          />
        </div>
      ) : null}
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
VestingScheduleDetailed.getLayout = function getLayout(page: ReactElement) {
  const router = useRouter();
  const { schedule } = router.query;
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Vesting schedule summary', route: `/vesting-schedule/${schedule}` }
  ];
  return (
    <SteppedLayout title="Vesting schedule" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default VestingScheduleDetailed;
