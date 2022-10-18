import type { ERC20 } from 'contracts/ERC20';
import useSWR from 'swr';

import useKeepSWRDataLiveAsBlocksArrive from './useKeepSWRDataLiveAsBlocksArrive';
import useTokenContract from './useTokenContract';

function getTokenBalance(contract: ERC20 | null) {
  return async (_: string, address: string) => {
    const balance = contract ? await contract.balanceOf(address) : 0;

    return balance;
  };
}

export default function useTokenBalance(address: string, tokenAddress: string, suspense = false) {
  const contract = useTokenContract(tokenAddress);

  const shouldFetch = typeof address === 'string' && typeof tokenAddress === 'string' && !!contract;

  const result = useSWR(shouldFetch ? ['TokenBalance', address, tokenAddress] : null, getTokenBalance(contract), {
    suspense
  });

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
