import { useEffect } from 'react';
import { fetchOrg } from 'services/db/organization';
import { IOrganization } from 'types/models';

import { useShallowState } from './useShallowState';

export default function useOrganizations(organizationIds: string[]) {
  const [state, setState] = useShallowState<{
    isLoading: boolean;
    organizations: Array<{
      id: string;
      data: IOrganization;
    }>;
  }>({
    isLoading: false,
    organizations: []
  });

  useEffect(() => {
    if (!organizationIds?.length) {
      setState({ organizations: [] });
      return;
    }

    setState({ isLoading: true });
    const fetchOrgsQuery = organizationIds.map((id) => fetchOrg(id));
    Promise.all(fetchOrgsQuery)
      .then((orgs) => {
        const organizations = orgs
          .filter((org) => !!org)
          .map((org, index) => ({
            id: organizationIds[index],
            data: org as IOrganization
          }));
        setState({ organizations });
      })
      .catch(console.error)
      .finally(() => {
        setState({ isLoading: false });
      });
  }, [organizationIds]);

  return state;
}
