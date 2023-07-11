import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@utils/queries';
import { IOrganizationResponse } from 'interfaces/organization';
import { useMemo } from 'react';
import { fetchOrg } from 'services/db/organization';
import { IOrganization } from 'types/models';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// NEW API INTEGRATION
const useOrgStore = create(
  persist<OrgStoreState & OrgStoreActions>(
    (set) => ({
      organizations: [],
      save: (payload) => set({ organizations: [...payload] }),
      add: (payload) => set((state: OrgStoreState) => ({ organizations: [payload, ...state.organizations] })),
      clear: () => set({ organizations: [] })
    }),
    { name: 'vtvl-organizations' }
  )
);

type OrgStoreState = {
  organizations: IOrganizationResponse[];
};

type OrgStoreActions = {
  add: (payload: IOrganizationResponse) => void;
  save: (payload: IOrganizationResponse[]) => void;
  clear: () => void;
};

export const getOrgStore = () => useOrgStore.getState();

export const useOrganization = () => {
  const add = useOrgStore(({ add }: OrgStoreActions) => add);
  const save = useOrgStore(({ save }: OrgStoreActions) => save);
  const clear = useOrgStore(({ clear }: OrgStoreActions) => clear);
  const organizations = useOrgStore(({ organizations }: OrgStoreState) => organizations);

  const organizationId = organizations.length > 0 ? organizations[0].id : '';

  return {
    save,
    add,
    clear,
    organizations,
    organizationId
  };
};
