import { useDashboardContext } from '@providers/dashboard.context';
import { useMemo } from 'react';

export default function useVestingContract(vestingContractId: string) {
  const { vestingContracts } = useDashboardContext();

  const vestingContract = useMemo(() => {
    const selectedVestingContract = vestingContracts?.find((contract) => contract.id === vestingContractId);
    if (selectedVestingContract) {
      return selectedVestingContract;
    } else {
      undefined;
    }
  }, [vestingContracts]);

  return vestingContract;
}
