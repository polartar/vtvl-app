import { useWeb3React } from '@web3-react/core';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MultiValue } from 'react-select';
import { fetchVestingsByQuery, updateVesting } from 'services/db/vesting';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IVesting } from 'types/models';
import { IRecipient } from 'types/vesting';
import { generateRandomName } from 'utils/shared';

import { useAuthContext } from './auth.context';

export interface IScheduleFormState {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
  originalEndDateTime: Date | null | undefined;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  tokenId?: string;
  tokenAddress?: string;
  amountToBeVested: number;
  amountClaimed: number;
  amountUnclaimed: number;
}

export const INITIAL_VESTING_FORM_STATE: IScheduleFormState = {
  startDateTime: new Date(new Date().setHours(0, 0, 0, 0)),
  endDateTime: new Date(new Date().setHours(0, 0, 0, 0)),
  originalEndDateTime: new Date(new Date().setHours(0, 0, 0, 0)),
  cliffDuration: 'no-cliff',
  lumpSumReleaseAfterCliff: 25,
  releaseFrequency: 'continuous',
  amountToBeVested: 0,
  amountClaimed: 0,
  amountUnclaimed: 0
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
  const { account, chainId } = useWeb3React();
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
    if (organizationId && chainId) {
      fetchVestingsByQuery(['organizationId', 'chainId'], ['==', '=='], [organizationId, chainId]).then((res) => {
        // Check if the vesting schedules already has name, if none, generate one
        if (res.length) {
          const newVestings = res.map((schedule) => {
            const newScheduleDetails = { ...schedule };
            if (!schedule.data.name) {
              newScheduleDetails.data.name = generateRandomName();
              updateVesting({ ...newScheduleDetails.data }, schedule.id);
            }
            return newScheduleDetails;
          });
          setVestings(newVestings);
        }
      });
    }
  }, [organizationId, chainId]);

  return <VestingContext.Provider value={value}>{children}</VestingContext.Provider>;
}

export const useVestingContext = () => ({
  ...useContext(VestingContext)
});
