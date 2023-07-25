import VestingContractApiService from '@api-services/VestingContractApiService';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QUERY_KEYS } from 'utils/queries';

/**
 * Get vesting contracts' detailed info from vesting contract ids.
 * Vesting contract ids is coming from vestings data.
 */
export const useVestingContractsFromIds = (vestingContractIds: string[]) => {
  const { isLoading: isLoadingVestingContracts, data: vestingContracts } = useQuery(
    [QUERY_KEYS.VESTING_CONTRACT.FROM_IDS],
    () => {
      const getVestingContractsQuery = vestingContractIds.map((vestingId) =>
        VestingContractApiService.getVestingContractById(vestingId)
      );
      return Promise.all(getVestingContractsQuery);
    },
    {
      enabled: !!vestingContractIds?.length,
      select: (data) =>
        data
          ?.map((contract, index) => ({
            id: vestingContractIds[index],
            data: contract as IVestingContract
          }))
          ?.filter((contract) => Boolean(contract.data)) ?? []
    }
  );

  const vestingContractAddresses = useMemo(
    () =>
      vestingContracts?.map((contract) => contract.data?.address as string)?.filter((address) => Boolean(address)) ??
      [],
    [vestingContracts]
  );

  return useMemo(
    () => ({
      isLoadingVestingContracts,
      vestingContracts: vestingContracts ?? [],
      vestingContractAddresses
    }),
    [isLoadingVestingContracts, vestingContracts, vestingContractAddresses]
  );
};
