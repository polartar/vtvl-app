import { MilestoneConfigureSchedule } from '@components/molecules/MilestoneVesting/ConfigureSchedule';
import { VestingSetupPanel } from '@components/molecules/VestingSetupPanel';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import useSafePush from '@hooks/useSafePush';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useVestingContext } from '@providers/vesting.context';
import { useShallowState } from 'hooks/useShallowState';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import React, { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createMilestoneVesting } from 'services/db/milestoneVesting';
import { IMilestoneForm } from 'types/milestone';

const crumbSteps = [
  { title: 'Vesting schedule', route: '/vesting-schedule' },
  { title: 'Configure schedule', route: '/vesting-schedule/add-recipients' }
];
const wizardSteps = [
  {
    title: 'Schedule & contract',
    desc: 'Setup schedule and contract'
  },

  {
    title: `Create schedule`,
    desc: ''
  }
];

const CreateVestingSchedule: NextPageWithLayout = () => {
  const { setScheduleState, scheduleState, scheduleMode, isLinearVesting, setIsLinearVesting } = useVestingContext();
  const { user } = useAuthContext();
  const { vestingFactoryContract } = useDashboardContext();
  const [state, setState] = useShallowState({ step: vestingFactoryContract ? 1 : 0 });
  const router = useRouter();
  const { safePush } = useSafePush();

  useEffect(() => {
    if (isLinearVesting) {
      setIsLinearVesting(false);
    }
  }, [isLinearVesting]);

  const handleReturn = useCallback(() => {
    if (state.step === 0) safePush('/vesting-schedule');
    else {
      safePush(
        `/vesting-schedule/milestone/add-recipients${scheduleMode && scheduleMode.edit ? '?id=' + scheduleMode.id : ''}`
      );
      setState(({ step }) => ({ step: step - 1 }));
    }
  }, [state.step]);

  const moveToConfigureSection = useCallback(
    ({ scheduleName, contractName, createNewContract, vestingContractId }: any) => {
      setScheduleState({
        name: scheduleName,
        contractName,
        createNewContract,
        vestingContractId: vestingContractId
      });
      setState(({ step }) => ({ step: step + 1 }));
    },
    [setScheduleState]
  );

  const handleContinue = async (data: IMilestoneForm) => {
    try {
      await createMilestoneVesting({
        ...data,
        status: 'INITIALIZED',
        createdAt: Math.floor(new Date().getTime() / 1000),
        updatedAt: Math.floor(new Date().getTime() / 1000),
        createdBy: user?.memberInfo?.name || user?.displayName || user?.memberInfo?.email || ''
      });
      toast.success('The schedule was created successfully');
      safePush('/dashboard');
    } catch (err) {
      toast.error('Something went wrong while saving');
    }
  };

  useEffect(() => {
    if (router.query && router.query.step && router.query.step === '1') {
      setState({ step: 1 });
    }
  }, [router.query]);

  return (
    <SteppedLayout title="Configure schedule" steps={wizardSteps} crumbs={crumbSteps} currentStep={state.step}>
      {state.step === 0 && (
        <VestingSetupPanel initialState={scheduleState} onReturn={handleReturn} onContinue={moveToConfigureSection} />
      )}

      {state.step === 1 && <MilestoneConfigureSchedule onReturn={handleReturn} onContinue={handleContinue} />}
    </SteppedLayout>
  );
};

export default CreateVestingSchedule;
