import { useQuery } from '@tanstack/react-query';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { SupportedChainId } from 'types/constants/supported-chains';
import { getVestingDetailsFromContracts } from 'utils/multicall';
import { QUERY_KEYS } from 'utils/queries';

const TOTAL_ALLOCATION_AMOUNT_INDEX = 4;
const WITHDRAWN_AMOUNT_INDEX = 5;
const CLIFF_AMOUNT_INDEX = 6;

export type VestingInfo = {
  address: string;
  allocations: string;
  locked: string;
  withdrawn: string;
  unclaimed: string;
};

/**
 * Fetch on-chain vesting data
 */
export const useChainVestingsFromAddresses = (addresses: string[]) => {
  const { account, chainId } = useWeb3React();

  const {
    isLoading: isLoadingVestings,
    data: vestings,
    refetch: refetchVestings
  } = useQuery(
    [QUERY_KEYS.VESTING_INFO.FROM_CONTRACTS, chainId, account],
    () => getVestingDetailsFromContracts(chainId as SupportedChainId, addresses, String(account)),
    {
      enabled: !!addresses?.length && !!account && !!chainId
    }
  );

  return useMemo(
    () => ({ isLoadingVestings, vestings: vestings ?? [], refetchVestings }),
    [isLoadingVestings, vestings]
  );
};
