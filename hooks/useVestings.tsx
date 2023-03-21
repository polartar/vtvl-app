import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchVesting } from 'services/db/vesting';
import { IVesting } from 'types/models';
import { QUERY_KEYS } from 'utils/queries';

/**
 * Get recipient's vestings data
 */
export const useVestingsFromIds = (vestingIds: string[]) => {
  const { isLoading: isLoadingVestings, data: vestings } = useQuery(
    [QUERY_KEYS.VESTING.FROM_IDS],
    () => {
      const vestingQueries = vestingIds.map((vestingId) => fetchVesting(vestingId));
      return Promise.all(vestingQueries);
    },
    {
      enabled: !!vestingIds?.length,
      initialData: [],
      select: (data) =>
        data
          ?.map((vesting, index) => ({
            id: vestingIds[index],
            data: vesting as IVesting
          }))
          ?.filter((vesting) => Boolean(vesting.data)) ?? []
    }
  );

  // Array of tokenIds in vestings collection
  const vestingTokenIds = useMemo<string[]>(
    () => vestings?.map((vesting) => vesting.data.tokenId as string)?.filter((tokenId) => Boolean(tokenId)) ?? [],
    [vestings]
  );

  // Array of vestingContractIds in vesting collection
  const vestingContractIds = useMemo<string[]>(
    () =>
      vestings
        ?.map((vesting) => vesting.data.vestingContractId as string)
        ?.filter((vestingContractId) => Boolean(vestingContractId)) ?? [],
    [vestings]
  );

  return useMemo(
    () => ({
      isLoadingVestings,
      vestings: vestings ?? [],
      vestingTokenIds,
      vestingContractIds
    }),
    [isLoadingVestings, vestings, vestingTokenIds, vestingContractIds]
  );
};
