import Chip from '@components/atoms/Chip/Chip';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import VestingScheduleProfile from '@components/organisms/VestingSchedule/VestingScheduleProfile';
import VestingFilter from '@components/organisms/VestingSchedule/Vestings';
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useRecipientsByQuery } from '@hooks/useRecipientsByQuery';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useLoaderContext } from '@providers/loader.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import { IStatus } from 'interfaces/vesting';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IRecipient, IVesting } from 'types/models';
import { getActualDateTime } from 'utils/shared';
import { getDuration } from 'utils/vesting';

const VestingScheduleDetailed: NextPageWithLayout = () => {
  const router = useRouter();
  const { scheduleId } = router.query;
  const { account, library, chainId } = useWeb3React();
  const { vestings: allVestings, vestingContracts: allVestingContracts } = useDashboardContext();
  const { mintFormState } = useTokenContext();
  const { currentSafe } = useAuthContext();
  const { loading, hideLoading, showLoading } = useLoaderContext();
  const { transactions } = useTransactionLoaderContext();

  const [filter, setFilter] = useState<{
    keyword: string;
    status: IStatus;
  }>({ keyword: '', status: IStatus.ALL });
  // const [recipients, setRecipients] = useState<IRecipient[]>([]);
  const { recipients } = useRecipientsByQuery(`vestingId=${scheduleId}`);
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
        ? ethers.BigNumber.from(vestingContracts[0]?.balance || '0').sub(
            vestingSchedulesInfo[0].numTokensReservedForVesting || '0'
          )
        : ethers.BigNumber.from(0)
    };
  }, [vestingSchedulesInfo, vestingContracts]);

  const getVestingScheduleDetails = async () => {
    console.log('fetching schedule', scheduleId);
    // Get the schedule details
    try {
      const getVestingSchedule = allVestings.filter((v) => v.id === scheduleId);

      if (getVestingSchedule?.length) {
        const actualDateTime = getActualDateTime(getVestingSchedule[0].data.details);
        setVestingSchedule({
          ...getVestingSchedule[0].data,
          details: {
            ...getVestingSchedule[0].data?.details,
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

  const approvers = new Array(currentSafe?.threshold).fill({ title: '', desc: '' });
  const [transaction, setTransaction] = useState<ITransaction>();
  const [safeTransaction, setSafeTransaction] = useState<SafeTransaction>();

  // Copy of the one from AddVestingSchedule.tsx
  // To do Arvin: Optimize this along with the existing one
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
      setSafeTransaction({ ...safeTx });
    }
  };

  // Fetch the transaction by using the transaction id
  // With this, we can check whether the vesting schedule has multisig transactions
  useEffect(() => {
    if (vestingSchedule?.transactionId) {
      setTransaction(transactions.find((t) => t.id === vestingSchedule.transactionId));
    }
  }, [vestingSchedule, transactions]);

  // Actually fetch the Safe transaction
  useEffect(() => {
    if (transaction?.safeHash) {
      fetchSafeTransactionFromHash(transaction.safeHash);
    }
  }, [transaction, account]);

  return (
    <>
      {!loading && vesting ? (
        <div className="w-full text-left">
          <div className="flex items-center gap-3 text-3xl font-bold mb-6">
            {vesting.data.name}
            {vesting.data.status === 'LIVE' && <Chip color="successAlt" label="Active" />}
          </div>
          <TokenProfile {...mintFormState} className="mb-6" />
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
            totalBalance={vestingContracts[0].balance?.toString() || '0'}
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
