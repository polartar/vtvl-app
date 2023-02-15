import { useEffect, useMemo } from 'react';
import { fetchVestingContract } from 'services/db/vestingContract';
import { IVestingContract } from 'types/models';

import { useShallowState } from './useShallowState';

/**
 * Get vesting contracts' detailed info from vesting contract ids.
 * Vesting contract ids is coming from vestings data.
 */
export default function useVestingContracts(vestingContractIds: string[]) {
  const [state, setState] = useShallowState<{
    isLoading: boolean;
    contracts: Array<{
      id: string;
      data: IVestingContract;
    }>;
  }>({
    isLoading: false,
    contracts: []
  });

  const vestingContracts = useMemo(() => state.contracts.map(({ data }) => data), [state.contracts]);

  useEffect(() => {
    if (!vestingContractIds?.length) setState({ contracts: [] });

    setState({ isLoading: true });
    const getVestingContractsQuery = vestingContractIds.map((vestingId) => fetchVestingContract(vestingId));
    Promise.all(getVestingContractsQuery)
      .then((res) => {
        const contracts = res
          .map((contract, index) => ({
            id: vestingContractIds[index],
            data: contract as IVestingContract
          }))
          .filter(({ data }) => !!data);

        setState({
          contracts
        });
      })
      .catch(console.error)
      .finally(() => {
        setState({ isLoading: false });
      });
  }, [vestingContractIds]);

  return { isLoading: state.isLoading, contracts: state.contracts, vestingContracts };
}
