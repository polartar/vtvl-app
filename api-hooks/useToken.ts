import OrganizationApiService from '@api-services/OrganizationApiService';
import TokenApiService from '@api-services/TokenApiService';
import { useAuth } from '@hooks/useAuth';
import { useOrganization as useOrgstore } from '@hooks/useOrganizations';
import { TOAST_NOTIFICATION_IDS } from '@utils/constants';
import { IOrgMemberInviteRequest, IOrgMemberRequest, IOrganizationRequest } from 'interfaces/organization';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './messages';

const useTokenApi = () => {
  const { save: saveOrg, add: addOrg, clear: clearOrg } = useOrgstore();
  const { saveUser } = useAuth();

  const createToken = useCallback((payload: ICreateDeployedTokenRequest) => {
    return TokenApiService.createToken(payload)
      .then((res) => {
        console.log('createToken - ', res);
        return res;
      })
      .catch((error) => {
        // toast.error(ERROR_MESSAGES.EN.GET_MEMBERS, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        console.error('createToken - ', error);
      });
  }, []);

  const importToken = useCallback((payload: IImportTokenRequest) => {
    return TokenApiService.createToken(payload)
      .then((res) => {
        console.log('importToken - ', res);
        return res;
      })
      .catch((error) => {
        // toast.error(ERROR_MESSAGES.EN.GET_MEMBERS, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        console.error('importToken - ', error);
      });
  }, []);

  return useMemo(
    () => ({
      createToken,
      importToken
    }),
    [createToken, importToken]
  );
};

export default useTokenApi;
