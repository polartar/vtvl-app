import { useOrganization as useOrgstore } from '@hooks/useOrganizations';
import OrganizationApiService from 'api-services/OrganizationApiService';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './messages';

const useOrganization = () => {
  const { save: saveOrg, clear: clearOrg } = useOrgstore();

  const getOrganizations = useCallback(() => {
    return OrganizationApiService.getOrganizations()
      .then((res) => {
        console.log('ORGANIZATION DATA', res);
        saveOrg(res);
      })
      .catch((error) => {
        console.log('ORGANIZATION ERROR', error);
        toast.error(ERROR_MESSAGES.EN.GET_ORGANIZATIONS);
      });
  }, []);

  return useMemo(
    () => ({
      getOrganizations
    }),
    []
  );
};

export default useOrganization;
