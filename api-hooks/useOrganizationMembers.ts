import OrganizationApiService from '@api-services/OrganizationApiService';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import QUERY_KEYS from './queries';

export const useOrganizationMembers = (organizationId: string) => {
  const {
    isLoading: isLoadingMembers,
    data: members,
    refetch: refetchMembers
  } = useQuery(
    [QUERY_KEYS.ORGANIZATION.GET_MEMBERS, organizationId],
    () => OrganizationApiService.getMembers(organizationId),
    {
      enabled: Boolean(organizationId)
    }
  );

  return useMemo(
    () => ({
      isLoadingMembers,
      members,
      refetchMembers
    }),
    [isLoadingMembers, members]
  );
};
