import RecipientApiService from '@api-services/RecipientApiService';
import VestingScheduleApiService from '@api-services/VestingScheduleApiService';
import { transformVestingSchedule } from '@utils/vesting';
import { useWeb3React } from '@web3-react/core';
import { useShallowState } from 'hooks/useShallowState';
import { useRouter } from 'next/router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CliffDuration, DateDurationOptionValues, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IRecipient, IVesting } from 'types/models';
import { IScheduleMode, IScheduleState } from 'types/vesting';
import { getActualDateTime } from 'utils/shared';

import { useAuthContext } from './auth.context';
import { useDashboardContext } from './dashboard.context';
import { useLoaderContext } from './loader.context';

export interface IScheduleFormState {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
  originalEndDateTime: Date | null | undefined;
  cliffDuration: CliffDuration;
  cliffDurationNumber?: number;
  cliffDurationOption?: DateDurationOptionValues | CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  releaseFrequencySelectedOption?: string;
  customReleaseFrequencyNumber?: number;
  customReleaseFrequencyOption?: string;
  tokenId?: string;
  tokenAddress?: string;
  amountToBeVested: number;
  amountClaimed: number;
  amountUnclaimed: number;
}

export const INITIAL_VESTING_FORM_STATE: IScheduleFormState = {
  startDateTime: new Date(new Date().setHours(0, 0, 0, 0)),
  endDateTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0, 0)),
  originalEndDateTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0, 0)),
  cliffDuration: 'no_cliff',
  lumpSumReleaseAfterCliff: 25,
  releaseFrequency: 'continuous',
  amountToBeVested: 0,
  amountClaimed: 0,
  amountUnclaimed: 0
};

const INITIAL_SCHEDULE_MODE: IScheduleMode = {
  id: '',
  edit: false,
  delete: false,
  data: undefined
};

const INITIAL_SCHEDULE_STATE: IScheduleState = {
  name: '',
  contractName: '',
  createNewContract: true,
  vestingContractId: ''
};

interface IVestingData {
  vestings: { id: string; data: IVesting }[];
  scheduleFormState: IScheduleFormState;
  recipients: IRecipient[];
  scheduleState: IScheduleState;
  scheduleMode: IScheduleMode;
  updateScheduleFormState: (v: any) => void;
  updateRecipients: (v: any) => void;
  resetVestingState: () => void;
  setScheduleState: (v: Partial<IScheduleState>) => void;
  editSchedule: (id: string, data: IVesting) => void;
  deleteSchedulePrompt: (id: string, data: IVesting) => void;
  deleteSchedule: (id: string) => void;
  deleteInProgress: boolean;
  setDeleteInProgress: (v: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (v: boolean) => void;
  isLinearVesting: boolean;
  setIsLinearVesting: (v: boolean) => void;
  showVestingSelectModal: boolean;
  setShowVestingSelectModal: (v: boolean) => void;
}

const VestingContext = createContext({} as IVestingData);

export function VestingContextProvider({ children }: any) {
  const { account, chainId } = useWeb3React();
  const { organizationId } = useAuthContext();
  const { showLoading, hideLoading } = useLoaderContext();
  const { vestingFactoryContract } = useDashboardContext();

  const [vestings, setVestings] = useState<{ id: string; data: IVesting }[]>([]);
  // This contains all the details regarding the schedule form in the /configure
  const [scheduleFormState, setScheduleFormState] = useState<IScheduleFormState>(INITIAL_VESTING_FORM_STATE);
  // This contains all the details of the recipients and their allocations
  const [recipients, setRecipients] = useState<IRecipient[]>([]);
  // This contains the contract details being used in the vesting schedule
  const [scheduleState, setScheduleState] = useShallowState(INITIAL_SCHEDULE_STATE);
  // This contains the mode to which the vesting schedule is being run
  const [scheduleMode, setScheduleMode] = useShallowState(INITIAL_SCHEDULE_MODE);

  const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showVestingSelectModal, setShowVestingSelectModal] = useState<boolean>(false);
  const [isLinearVesting, setIsLinearVesting] = useState<boolean>(true);

  const router = useRouter();

  const resetVestingState = useCallback(() => {
    setScheduleFormState(INITIAL_VESTING_FORM_STATE);
    setRecipients([]);
    setScheduleMode(INITIAL_SCHEDULE_MODE);
    setScheduleState({
      ...INITIAL_SCHEDULE_STATE,
      contractName: vestingFactoryContract?.name,
      vestingContractId: vestingFactoryContract?.id,
      createNewContract: !vestingFactoryContract?.id
    });
  }, [vestingFactoryContract]);

  // Updates the states related to the vesting schedule to be edited
  const updateScheduleStates = (id: string, data: IVesting) => {
    // Set everything here
    // Sets the vesting schedule configuration form based on the details
    // Ensure that the dates are in actual form because firebase db return a Timestamp format
    const actualDates = getActualDateTime(data.details);
    setScheduleFormState({
      ...data.details,
      endDateTime: actualDates.endDateTime,
      startDateTime: actualDates.startDateTime,
      originalEndDateTime: actualDates.originalEndDateTime
    });
    // Sets the recipient list based on the data
    // setRecipients([...data.recipients]);
    // Sets the schedule mode
    setScheduleMode({ id, edit: true, data });
    // Sets the schedule state
    setScheduleState({
      name: data.name,
      contractName: '',
      createNewContract: false,
      vestingContractId: data.vestingContractId
    });
  };

  // This function is used to initialize editing of the schedule.
  const editSchedule = useCallback(
    async (id: string, data: IVesting) => {
      showLoading();

      // const recipientsData = await fetchRecipientsByQuery(['vestingId'], ['=='], [id]);
      const recipientsData = await RecipientApiService.getRecipients(`vestingId=${id}`);

      console.log('EDIT:::: EDIT INITIALIZED', id, data);
      updateScheduleStates(id, data);
      setRecipients(recipientsData);

      router.push(`/vesting-schedule/add-recipients?id=${id}`);

      hideLoading();
    },
    [router, showLoading, hideLoading]
  );

  // Updates the state on what to delete
  const deleteSchedulePrompt = (id: string, data: IVesting) => {
    console.log('DELETE:::: DELETE INITIALIZED', id, data);
    setScheduleMode({ id, data, delete: true, edit: false });
  };

  // Removes the schedule from the DB
  const deleteSchedule = async (id: string) => {
    console.log('DELETE:::: DELETING', id);
    return await VestingScheduleApiService.removeVestingSchedule(id);
  };

  // Checks for routes and apply necessary state updates
  const vestingScheduleRouteChecks = async () => {
    // All allowed paths on edit.
    const allowedPaths = [
      '/vesting-schedule/add-recipients',
      '/vesting-schedule/configure',
      '/vesting-schedule/summary',
      '/vesting-schedule/success'
    ];
    if (allowedPaths.includes(router.route)) {
      // Do this only on allowed paths.
      console.log('EDIT::::');
      if (router.route !== '/vesting-schedule/success') {
        // Check the state if it already has an ID being edited.
        if (router.query.id) {
          setScheduleMode({ ...scheduleMode, edit: true });
          if (scheduleMode.id === router.query.id) {
            // Do nothing, assumes that the record is already in place
            console.log(
              'EDIT:::: ASSUME RECORD IS IN PLACE',
              scheduleMode,
              scheduleState,
              scheduleFormState,
              recipients
            );
          } else {
            // Fetch the records related to this vesting schedule ID.
            // This is useful when the page is refreshed as the state resets.
            console.log('EDIT:::: FETCH VESTING SCHEDULE');
            const vestingSchedule = vestings.filter((v) => v.id === router.query.id);
            if (vestingSchedule?.length) {
              updateScheduleStates(router.query.id as string, vestingSchedule[0].data);
            }
          }
        }
      }
    } else {
      // Reset vesting state when not in vesting schedule form
      resetVestingState();
    }
  };

  const getVestingSchedules = async () => {
    if (!organizationId || !chainId) return;

    const schedules = await VestingScheduleApiService.getVestingSchedules(organizationId);
    setVestings(
      schedules.map((vestingSchedule) => ({ id: vestingSchedule.id!, data: transformVestingSchedule(vestingSchedule) }))
    );
  };

  const value = useMemo(
    () => ({
      vestings,
      scheduleFormState,
      recipients,
      scheduleMode,
      updateRecipients: setRecipients,
      updateScheduleFormState: setScheduleFormState,
      resetVestingState,
      scheduleState,
      setScheduleState,
      setScheduleMode,
      editSchedule,
      deleteSchedule,
      deleteSchedulePrompt,
      deleteInProgress,
      setDeleteInProgress,
      showDeleteModal,
      setShowDeleteModal,
      isLinearVesting,
      setIsLinearVesting,
      showVestingSelectModal,
      setShowVestingSelectModal
    }),
    [
      scheduleFormState,
      recipients,
      scheduleState,
      scheduleMode,
      deleteInProgress,
      showDeleteModal,
      setScheduleState,
      setShowDeleteModal,
      isLinearVesting,
      showVestingSelectModal
    ]
  );

  useEffect(() => {
    if (account) {
      // fetchContractByQuery('owner', '==', account).then((res) => {
      //   setScheduleFormState((scheduleFormState: any) => ({
      //     ...scheduleFormState,
      //     token: res?.address
      //   }));
      // });
    }
  }, [account]);

  useEffect(() => {
    setScheduleState({
      ...INITIAL_SCHEDULE_STATE,
      createNewContract: !vestingFactoryContract?.id,
      contractName: vestingFactoryContract?.name || '',
      vestingContractId: vestingFactoryContract?.id || ''
    });
  }, [vestingFactoryContract]);

  useEffect(() => {
    if (organizationId && chainId) getVestingSchedules();
  }, [organizationId, chainId]);

  // Checks for the route changes related to the vesting schedule.
  useEffect(() => {
    vestingScheduleRouteChecks();
  }, [router.route]);

  return <VestingContext.Provider value={value}>{children}</VestingContext.Provider>;
}

export const useVestingContext = () => ({
  ...useContext(VestingContext)
});
