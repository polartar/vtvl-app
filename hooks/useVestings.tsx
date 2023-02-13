import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo } from 'react';
import { fetchVestingsByQuery } from 'services/db/vesting';
import { IVesting } from 'types/models';
import { compareAddresses } from 'utils';

import { useShallowState } from './useShallowState';

/**
 * Get recipient's vestings data
 */
export default function useVestings() {
  const { chainId, account } = useWeb3React();
  const [state, setState] = useShallowState<{
    isLoading: boolean;
    vestings: {
      id: string;
      data: IVesting;
    }[];
  }>({
    isLoading: false,
    vestings: []
  });

  /**
   * The array of vesting ids that current user can claim
   */
  const vestingIds = useMemo(() => state.vestings.map(({ id }) => id), [state.vestings]);

  /**
   * The array of oranization ids that current user joined
   */
  const organizationIds = useMemo(
    () =>
      state.vestings
        .map(({ data }) => data.organizationId)
        .filter((organizationId) => !!organizationId)
        .reduce((val, organizationId) => {
          if (val.includes(organizationId)) return val;
          return [...val, organizationId];
        }, [] as string[]),
    [state.vestings]
  );

  /**
   * The array of token ids that current user can claim
   */
  const tokenIds = useMemo(
    () =>
      state.vestings
        .map(({ data }) => String(data.tokenId))
        .filter((tokenId) => !!tokenId)
        .reduce((val, tokenId) => {
          if (val.includes(tokenId)) return val;
          return [...val, tokenId];
        }, [] as string[]),
    [state.vestings]
  );

  /**
   * The array of vesting contract ids that current user can claim
   */
  const vestingContractIds = useMemo(
    () =>
      state.vestings
        .map(({ data }) => String(data.vestingContractId))
        .filter((vestingContractId) => !!vestingContractId)
        .reduce((val, contractId) => {
          if (val.includes(contractId)) return val;
          return [...val, contractId];
        }, [] as string[]),
    [state.vestings]
  );

  /**
   * The array of recipient data that current user can claim the vesting token
   */
  const recipes = useMemo(() => {
    if (!account) return [];

    return state.vestings
      .map((vesting) => {
        const recipient = vesting.data.recipients.find((recipient) =>
          compareAddresses(recipient.walletAddress, account)
        );
        if (!recipient) return undefined;

        return {
          vestingId: vesting.id,
          organizationId: vesting.data.organizationId,
          tokenId: vesting.data.tokenId,
          vestingContractId: vesting.data.vestingContractId,
          allocations: recipient.allocations
        };
      })
      .filter((recipient) => !!recipient);
  }, [state.vestings, account]);

  useEffect(() => {
    if (!chainId || !account) return;

    setState({ isLoading: true });
    fetchVestingsByQuery(['chainId'], ['=='], [chainId])
      .then((vestings) => {
        setState({
          vestings: vestings.filter(
            (v) =>
              v &&
              !v.data.archive &&
              v.data.status !== 'REVOKED' &&
              v.data.chainId === chainId &&
              v.data.recipients.find((recipient) => compareAddresses(recipient.walletAddress, account))
          )
        });
      })
      .catch(console.error)
      .finally(() => {
        setState({ isLoading: false });
      });
  }, [chainId, account]);

  return {
    isLoading: state.isLoading,
    vestings: state.vestings,
    vestingIds,
    organizationIds,
    tokenIds,
    recipes,
    vestingContractIds
  };
}
