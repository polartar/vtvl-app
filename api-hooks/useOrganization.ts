import OrganizationApiService from '@api-services/OrganizationApiService';
import { useAuth } from '@store/useAuth';
import { useOrganization as useOrgstore } from '@store/useOrganizations';
import { TOAST_NOTIFICATION_IDS } from '@utils/constants';
import { IOrgMemberInviteRequest, IOrgMemberRequest, IOrganizationRequest } from 'interfaces/organization';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './messages';

const useOrgAPI = () => {
  const { save: saveOrg, add: addOrg, clear: clearOrg } = useOrgstore();
  const { saveUser } = useAuth();

  const getOrganizations = useCallback(() => {
    return OrganizationApiService.getOrganizations()
      .then((res) => {
        console.log('ORGANIZATION DATA', res);
        saveOrg(res);
        return res;
      })
      .catch((error) => {
        console.log('ORGANIZATION ERROR', error);
        toast.error(ERROR_MESSAGES.EN.GET_ORGANIZATIONS, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  const createOrganization = useCallback((payload: IOrganizationRequest) => {
    return OrganizationApiService.createOrganization(payload)
      .then((res) => {
        console.log('ORGANIZATION CREATE DATA', res);
        saveUser(res.userId);
        addOrg(res);
        toast.success(SUCCESS_MESSAGES.EN.CREATE_ORGANIZATION, { toastId: TOAST_NOTIFICATION_IDS.SUCCESS });
        return res;
      })
      .catch((error) => {
        console.log('AUTH LOGIN ERROR', error);
        toast.error(ERROR_MESSAGES.EN.CREATE_ORGANIZATION, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  // Organization Member API hooks
  const getMembers = useCallback((id: string) => {
    return OrganizationApiService.getMembers(id)
      .then((res) => {
        console.log('ORGANIZATION MEMBERS DATA', res);
        return res;
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.GET_MEMBERS, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  const createMember = useCallback((payload: IOrgMemberRequest) => {
    return OrganizationApiService.createMember(payload)
      .then((res) => {
        console.log('ORGANIZATION MEMBER CREATE DATA', res);
        return res;
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.CREATE_MEMBER, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  const inviteMember = useCallback((payload: IOrgMemberInviteRequest) => {
    return OrganizationApiService.inviteMember(payload)
      .then((res) => {
        console.log('MEMBER INVITED', payload.name);
        toast.success(`${payload.name} has been invited`);
        return res;
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.INVITE_MEMBER, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  return useMemo(
    () => ({
      getOrganizations,
      createOrganization,
      getMembers,
      createMember,
      inviteMember
    }),
    []
  );
};

export default useOrgAPI;
