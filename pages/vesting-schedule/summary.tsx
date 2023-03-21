import BackButton from '@components/atoms/BackButton/BackButton';
import Chip from '@components/atoms/Chip/Chip';
import ScheduleDetails from '@components/molecules/ScheduleDetails/ScheduleDetails';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { useWeb3React } from '@web3-react/core';
import { injected } from 'connectors';
import Decimal from 'decimal.js';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { useAuthContext } from 'providers/auth.context';
import { ReactElement } from 'react';
import { createRecipient, editRecipient } from 'services/db/recipient';
import { createVesting, updateVesting } from 'services/db/vesting';
import { createVestingContract } from 'services/db/vestingContract';
import { formatRecipientsDocToForm } from 'utils/recipients';
import { formatNumber } from 'utils/token';

const ScheduleSummary: NextPageWithLayout = () => {
  const { account, activate, chainId } = useWeb3React();
  const { organizationId } = useAuthContext();
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

    // Set the vestingContractId based on the scheduleState value coming from the previous forms.
    let vestingContractId = scheduleState.vestingContractId;
    // If the contract is set to be a new one, let's create one.
    if (scheduleState.createNewContract) {
      vestingContractId = await createVestingContract({
        status: 'INITIALIZED',
        name: scheduleState.contractName!,
        tokenAddress: mintFormState.address,
        address: '',
        deployer: '',
        organizationId: organizationId!,
        chainId,
        transactionId: '',
        createdAt: Math.floor(new Date().getTime() / 1000),
        updatedAt: Math.floor(new Date().getTime() / 1000)
      });
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
          transactionId: '',
          vestingContractId
        },
        scheduleMode.id
      );

      await Promise.all(
        recipients
          .filter((recipient) => Boolean(recipient.id))
          .map((recipient) => editRecipient(recipient.id, recipient.data))
      );
    } else {
      const vestingId = await createVesting({
        name: scheduleState.name,
        details: { ...scheduleFormState },
        organizationId: organizationId!,
        status: 'INITIALIZED',
        createdAt: Math.floor(new Date().getTime() / 1000),
        updatedAt: Math.floor(new Date().getTime() / 1000),
        transactionId: '',
        vestingContractId,
        tokenAddress: mintFormState.address,
        tokenId,
        chainId
      });

      const newRecipients = recipients.map(({ data: recipient }) =>
        createRecipient({
          vestingId: String(vestingId),
          organizationId: String(organizationId),
          name: recipient.name,
          email: recipient.email,
          allocations: String(recipient.allocations ?? 0),
          walletAddress: String(recipient.walletAddress),
          recipientType: String(recipient.recipientType),
          status: recipient.walletAddress ? 'accepted' : 'delivered'
        })
      );

      await Promise.all(newRecipients);
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
          {recipients.map(({ data: recipient }) => (
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
