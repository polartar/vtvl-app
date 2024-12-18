import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchVestingContract } from 'services/db/vestingContract';
import { IVestingContract } from 'types/models';
import { QUERY_KEYS } from 'utils/queries';

/**
 * Get vesting contracts' detailed info from vesting contract ids.
 * Vesting contract ids is coming from vestings data.
 */
export const useVestingContractsFromIds = (vestingContractIds: string[]) => {
  const { isLoading: isLoadingVestingContracts, data: vestingContracts } = useQuery(
    [QUERY_KEYS.VESTING_CONTRACT.FROM_IDS],
    () => {
      const getVestingContractsQuery = vestingContractIds.map((vestingId) => fetchVestingContract(vestingId));
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
      vestingContracts: vestingContracts ? vestingContracts.filter((contract) => !!contract.data.address) : [],
      vestingContractAddresses
    }),
    [isLoadingVestingContracts, vestingContracts, vestingContractAddresses]
  );
};
