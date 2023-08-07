import RecipientApiService from '@api-services/RecipientApiService';
import VestingContractApiService from '@api-services/VestingContractApiService';
import VestingScheduleApiService from '@api-services/VestingScheduleApiService';
import BackButton from '@components/atoms/BackButton/BackButton';
import Chip from '@components/atoms/Chip/Chip';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { REDIRECT_URIS } from '@utils/constants';
import { getCliffAmount, transformCliffDurationType } from '@utils/vesting';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import Decimal from 'decimal.js';
import { ECliffTypes, EReleaseFrequencyTypes } from 'interfaces/vestingSchedule';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import { ReactElement } from 'react';
import { createVesting, updateVesting } from 'services/db/vesting';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { formatRecipientsDocToForm } from 'utils/recipients';
import { formatNumber } from 'utils/token';

const ScheduleSummary: NextPageWithLayout = () => {
  const { account, activate, chainId } = useWeb3React();
  const { organizationId, user } = useAuthContext();
  const { updateVestingContract } = useDashboardContext();
  const { recipients, scheduleFormState, scheduleState, scheduleMode, setScheduleState } = useVestingContext();
  const { mintFormState, tokenId } = useTokenContext();

  /**
   * Handles the click function when user clicks the "Create schedule"
   * This creates a vestingContract and vesting record in the DB for initial tracking purpose
   * @returns
   */
  const handleCreateSchedule = async () => {
    // Check if the user is currently connected to their wallet.
    if (!account || !chainId) {
      activate(injected);
      return;
    }

    // const PERFORM_CREATE_FUNCTION = 'function performCreate(uint256 value, bytes memory deploymentData)';
    // const PERFORM_CREATE_INTERFACE = 'performCreate(uint256,bytes)';
    // const ABI = [PERFORM_CREATE_FUNCTION];

    // If the contract is set to be a new one, let's create one.

    let vestingContractId = scheduleState.vestingContractId;
    if (scheduleState.createNewContract) {
      const vestingContract = await VestingContractApiService.createVestingContract({
        name: scheduleState.contractName!,
        tokenId: mintFormState.id ?? '',
        organizationId: organizationId!,
        chainId: chainId ?? 0
      });
      vestingContractId = vestingContract.id;
      updateVestingContract(vestingContract);
    }

    // Create a draft vesting record -- which has a status of "CREATING".
    // Draft records can still be edited or deleted as long as it's not yet funded.
    if (scheduleMode && scheduleMode.edit && scheduleMode.id && scheduleMode.data) {
      await updateVesting(
        {
          ...scheduleMode.data,
          name: scheduleState.name,
          details: { ...scheduleFormState },
          updatedAt: Math.floor(new Date().getTime() / 1000),
          transactionId: ''
          // vestingContractId
        },
        scheduleMode.id
      );

      await Promise.all(
        recipients
          .filter((recipient) => Boolean(recipient.id))
          .map((recipient) => RecipientApiService.updateRecipient(recipient.id, recipient))
      );
    } else {
      const vesting = await VestingScheduleApiService.createVestingSchedule({
        organizationId: organizationId!,
        status: 'INITIALIZED',
        // vestingContractId,
        tokenId: tokenId || '4a64cfcd-03d7-45d9-b9df-e0d088f18546',
        vestingContractId: String(vestingContractId),
        name: scheduleState.name,
        startedAt: scheduleFormState.startDateTime?.toISOString(),
        endedAt: scheduleFormState.endDateTime?.toISOString(),
        originalEndedAt: scheduleFormState.originalEndDateTime?.toISOString(),
        releaseFrequencyType: scheduleFormState.releaseFrequency,
        releaseFrequency: Number(scheduleFormState.customReleaseFrequencyNumber),
        cliffDurationType: transformCliffDurationType(scheduleFormState.cliffDuration),
        cliffDuration: Number(scheduleFormState.cliffDurationNumber),
        cliffAmount: '1111111',
        amount: Number(scheduleFormState.amountToBeVested).toString(),
        recipes: [],
        redirectUri: REDIRECT_URIS.RECIPIENT_INVITE
      });

      // const vestingId = await createVesting({
      //   name: scheduleState.name,
      //   details: { ...scheduleFormState },
      //   organizationId: organizationId!,
      //   status: 'INITIALIZED',
      //   createdAt: Math.floor(new Date().getTime() / 1000),
      //   updatedAt: Math.floor(new Date().getTime() / 1000),
      //   transactionId: '',
      //   vestingContractId,
      //   tokenAddress: mintFormState.address,
      //   tokenId,
      //   chainId,
      //   createdBy: user?.uid
      // });

      // const newRecipients = recipients.map((recipient) =>
      //   createRecipient({
      //     vestingId: String(vesting.id),
      //     organizationId: String(organizationId),
      //     name: recipient.name,
      //     email: recipient.email,
      //     allocations: String(recipient.allocations ?? 0),
      //     walletAddress: String(recipient.address),
      //     recipientType: String(recipient.role),
      //     status: recipient.address ? 'accepted' : 'delivered'
      //   })
      // );

      // await Promise.all(newRecipients);
    }

    console.log('creating vesting schedule');
    // Redirect to the success page to notify the user
    await Router.push('/vesting-schedule/success');

    // Reset the value of everything else from the previous forms
    // resetVestingState();
    setScheduleState({
      name: '',
      contractName: '',
      createNewContract: false,
      vestingContractId: ''
    });
  };

  return (
    <>
      <div className="w-full mb-6 panel max-w-2xl">
        <label>
          <span>Recipient(s)</span>
        </label>
        <div className="flex flex-row flex-wrap gap-2 pb-5 border-b border-neutral-200">
          {recipients.map((recipient) => (
            <Chip rounded label={recipient.name} color="random" />
          ))}
        </div>
        <div className="py-5 border-b border-neutral-200 grid grid-cols-2 gap-3">
          <label>
            <span>Total token per recipient</span>
            <p>
              {formatNumber(
                new Decimal(scheduleFormState.amountToBeVested)
                  .div(new Decimal(recipients.length))
                  .toDP(6, Decimal.ROUND_UP)
              )}{' '}
              {mintFormState.symbol || 'Token'}
            </p>
          </label>
          <label>
            <span>Total locked tokens</span>
            <p>
              {formatNumber(new Decimal(scheduleFormState.amountToBeVested).toDP(6, Decimal.ROUND_UP))}{' '}
              {mintFormState.symbol || 'Token'}
            </p>
          </label>
        </div>
        <div className="py-5 border-b border-neutral-200">
          <ScheduleDetails {...scheduleFormState} token={mintFormState.symbol || 'Token'} />
        </div>
        <div className="flex flex-row justify-between items-center border-t border-neutral-200 pt-5">
          <BackButton label="Return" href="/vesting-schedule/configure" />
          <button className="primary" type="button" onClick={handleCreateSchedule}>
            {scheduleMode && scheduleMode.edit ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </div>
      </div>
    </>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
ScheduleSummary.getLayout = function getLayout(page: ReactElement) {
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'Vesting schedule', route: '/vesting-schedule' },
    { title: 'Configure schedule', route: '/vesting-schedule/add-recipients' }
  ];

  // Update these into a state coming from the context
  const wizardSteps = [
    {
      title: 'Schedule & contract',
      desc: 'Setup schedule and contract'
    },
    {
      title: 'Add recipient(s)',
      desc: ''
    },
    {
      title: 'Setup schedule',
      desc: ''
    },
    {
      title: 'Schedule summary',
      desc: ''
    }
  ];
  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={3}>
      {page}
    </SteppedLayout>
  );
};

export default ScheduleSummary;
