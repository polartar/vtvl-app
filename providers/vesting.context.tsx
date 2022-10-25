import { useWeb3React } from '@web3-react/core';
import React, { SetStateAction, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { fetchContractByQuery } from 'services/db/contract';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IRecipient } from 'types/vesting';

export interface IScheduleFormState {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  amountToBeVested: number;
  token: string;
}

export const INITIAL_VESTING_FORM_STATE: IScheduleFormState = {
  startDateTime: new Date(),
  endDateTime: new Date(),
  cliffDuration: 'no-cliff',
  lumpSumReleaseAfterCliff: 25,
  releaseFrequency: 'continuous',
  amountToBeVested: 0,
  token: '0x6554b3fc5b5baf100e88a08503f62b83de9a0656'
};

const INITIAL_RECIPIENT_FORM_STATE = [] as MultiValue<IRecipient>;

interface IVestingData {
  scheduleFormState: IScheduleFormState;
  recipients: MultiValue<IRecipient>;
  updateScheduleFormState: (v: any) => void;
  updateRecipients: (v: any) => void;
}

const VestingContext = createContext({} as IVestingData);

export function VestingContextProvider({ children }: any) {
  const { account } = useWeb3React();

  const [scheduleFormState, setScheduleFormState] = useState<IScheduleFormState>(INITIAL_VESTING_FORM_STATE);
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENT_FORM_STATE);

  const value = useMemo(
    () => ({
      scheduleFormState,
      recipients,
      updateRecipients: setRecipients,
      updateScheduleFormState: setScheduleFormState
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

  return <VestingContext.Provider value={value}>{children}</VestingContext.Provider>;
}

export const useVestingContext = () => ({
  ...useContext(VestingContext)
});
