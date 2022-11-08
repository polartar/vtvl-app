import { useWeb3React } from '@web3-react/core';
import { Timestamp } from 'firebase/firestore';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IVesting } from 'types/models';
import { IRecipient } from 'types/vesting';

import { useAuthContext } from './auth.context';

export interface IScheduleFormState {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  amountToBeVested: number;
}

export const INITIAL_VESTING_FORM_STATE: IScheduleFormState = {
  startDateTime: new Date(),
  endDateTime: new Date(),
  cliffDuration: 'no-cliff',
  lumpSumReleaseAfterCliff: 25,
  releaseFrequency: 'continuous',
  amountToBeVested: 0
};

const INITIAL_RECIPIENT_FORM_STATE = [] as MultiValue<IRecipient>;

interface IVestingData {
  vestings: { id: string; data: IVesting }[];
  scheduleFormState: IScheduleFormState;
  recipients: MultiValue<IRecipient>;
  updateScheduleFormState: (v: any) => void;
  updateRecipients: (v: any) => void;
  resetVestingState: () => void;
}

const VestingContext = createContext({} as IVestingData);

export function VestingContextProvider({ children }: any) {
  const { account } = useWeb3React();
  const { organizationId } = useAuthContext();

  const [vestings, setVestings] = useState<{ id: string; data: IVesting }[]>([]);
  const [scheduleFormState, setScheduleFormState] = useState<IScheduleFormState>(INITIAL_VESTING_FORM_STATE);
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENT_FORM_STATE);

  const resetVestingState = useCallback(() => {
    setScheduleFormState({ ...INITIAL_VESTING_FORM_STATE });
    setRecipients([]);
  }, []);

  const value = useMemo(
    () => ({
      vestings,
      scheduleFormState,
      recipients,
      updateRecipients: setRecipients,
      updateScheduleFormState: setScheduleFormState,
      resetVestingState
    }),
    [scheduleFormState, recipients]
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
    if (organizationId) {
      fetchVestingsByQuery('organizationId', '==', organizationId).then((res) => setVestings(res));
    }
  }, [organizationId]);

  return <VestingContext.Provider value={value}>{children}</VestingContext.Provider>;
}

export const useVestingContext = () => ({
  ...useContext(VestingContext)
});
