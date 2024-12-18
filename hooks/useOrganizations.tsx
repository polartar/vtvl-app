import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchOrg } from 'services/db/organization';
import { IOrganization } from 'types/models';
import { QUERY_KEYS } from 'utils/queries';

export const useOrganizationsFromIds = (organizationIds: string[]) => {
  // Fetch organizations by organizationIds
  const { isLoading: isLoadingOrganizations, data: organizations } = useQuery(
    [QUERY_KEYS.ORGANIZATION.FROM_IDS],
    () => {
      const fetchOrgsQuery = organizationIds.map((id) => fetchOrg(id));
      return Promise.all(fetchOrgsQuery);
    },
    {
      enabled: !!organizationIds?.length,
      select: (data) =>
        data
          ?.map((org, index) => ({
            id: organizationIds[index],
            data: org as IOrganization
          }))
          .filter((org) => Boolean(org.data)) ?? []
    }
  );

  return useMemo(
    () => ({
      isLoadingOrganizations,
      organizations: organizations ?? []
    }),
    [isLoadingOrganizations, organizations]
  );
};
