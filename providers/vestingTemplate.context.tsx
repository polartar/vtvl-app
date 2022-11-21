import { useWeb3React } from '@web3-react/core';
import { Timestamp } from 'firebase/firestore';
import React, { SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchVestingTemplatesByQuery } from 'services/db/vestingTemplate';
import { IVestingTemplate } from 'types/models';

import { useAuthContext } from './auth.context';

interface IVestingTemplateData {
  vestingTemplates: { id: string; data: IVestingTemplate }[];
}

const VestingTemplatesContext = createContext({} as IVestingTemplateData);

export function VestingTemplatesContextProvider({ children }: any) {
  const { account } = useWeb3React();
  const { organizationId } = useAuthContext();

  const [vestingTemplates, setVestingTemplates] = useState<{ id: string; data: IVestingTemplate }[]>([]);

  const value = useMemo(
    () => ({
      vestingTemplates
    }),
    [vestingTemplates]
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
      // Comment as this is currently not working
      // fetchVestingTemplatesByQuery('organizationId', '==', organizationId).then((res) => {
      //   console.log('TEMPLATES', res);
      //   setVestingTemplates(res);
      // });
    }
  }, [organizationId]);

  return <VestingTemplatesContext.Provider value={value}>{children}</VestingTemplatesContext.Provider>;
}

export const useVestingTemplatesContext = () => ({
  ...useContext(VestingTemplatesContext)
});
