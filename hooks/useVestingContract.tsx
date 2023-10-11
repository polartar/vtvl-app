import VestingContractApiService from '@api-services/VestingContractApiService';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { IVestingContractDoc } from 'types/models/vestingContract';
import { QUERY_KEYS } from 'utils/queries';

/**
 * Get vesting contracts' detailed info from vesting contract ids.
 * Vesting contract ids is coming from vestings data.
 */
export const useVestingContract = (organizationId: string | undefined, chainId: number | undefined) => {
  const { isLoading, data } = useQuery<IVestingContract | null>(
    [QUERY_KEYS.VESTING_CONTRACT.FROM_ORGANIZATION],
    async () => {
      const vestingContracts = await VestingContractApiService.getOrganizationVestingContracts(organizationId!);
      const vestingContractsByFactory = vestingContracts.filter(
        (vestingContract) => new Date(vestingContract.createdAt).getTime() / 1000 > 1695136710
      );
      return vestingContractsByFactory.length > 0 ? vestingContractsByFactory[0] : null;
    },
    {
      enabled: !!organizationId && !!chainId
    }
  );

  return useMemo(
    () => ({
      isLoading,
      vestingFactoryContract: data ?? undefined
    }),
    [isLoading, data]
  );
};
