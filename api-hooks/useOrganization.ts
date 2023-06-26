import OrganizationApiService from '@api-services/OrganizationApiService';
import { useAuth } from '@hooks/useAuth';
import { useOrganization as useOrgstore } from '@hooks/useOrganizations';
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
      })
      .catch((error) => {
        console.log('ORGANIZATION ERROR', error);
        toast.error(ERROR_MESSAGES.EN.GET_ORGANIZATIONS);
      });
  }, []);

  const createOrganization = useCallback((payload: IOrganizationRequest) => {
    return OrganizationApiService.createOrganization(payload)
      .then((res) => {
        console.log('ORGANIZATION CREATE DATA', res);
        saveUser(res.userId);
        addOrg(res);
        toast.success(SUCCESS_MESSAGES.EN.CREATE_ORGANIZATION);
      })
      .catch((error) => {
        console.log('AUTH LOGIN ERROR', error);
        toast.error(ERROR_MESSAGES.EN.CREATE_ORGANIZATION);
      });
  }, []);

  // Organization Member API hooks
  const getMembers = useCallback((id: string) => {
    return OrganizationApiService.getMembers(id)
      .then((res) => {
        console.log('ORGANIZATION MEMBERS DATA', res);
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.GET_MEMBERS);
      });
  }, []);

  const createMember = useCallback((payload: IOrgMemberRequest) => {
    return OrganizationApiService.createMember(payload)
      .then((res) => {
        console.log('ORGANIZATION MEMBER CREATE DATA', res);
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.CREATE_MEMBER);
      });
  }, []);

  const inviteMember = useCallback((payload: IOrgMemberInviteRequest) => {
    return OrganizationApiService.inviteMember(payload)
      .then((res) => {
        console.log('MEMBER INVITED', payload.name);
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.INVITE_MEMBER);
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
