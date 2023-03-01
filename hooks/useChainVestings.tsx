import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { ethers } from 'ethers';
import { BigNumber, BigNumberish } from 'ethers/lib/ethers';
import { useCallback, useEffect } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVestingContract } from 'types/models';
import { compareAddresses } from 'utils';

import { useShallowState } from './useShallowState';

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
export default function useChainVestings(vestingContracts: IVestingContract[]) {
  const { account, chainId } = useWeb3React();
  const [state, setState] = useShallowState<{
    isLoading: boolean;
    vestings: Array<VestingInfo>;
  }>({
    isLoading: false,
    vestings: []
  });

  const handleUpdate = useCallback(
    (contractAddress: string, fields: Array<keyof VestingInfo>, values: Array<string>) => {
      setState({ isLoading: true });
      const index = state.vestings.findIndex((vesting) => compareAddresses(vesting.address, contractAddress));
      if (index < 0) {
        setState({ isLoading: false });
        return;
      }

      const vestings = state.vestings.map((v) => {
        if (compareAddresses(v.address, contractAddress)) {
          const value = fields.reduce((val, field, index) => {
            return {
              ...val,
              [field]: values[index]
            };
          }, {} as Partial<VestingInfo>);
          return {
            ...v,
            ...value
          };
        }
        return v;
      });

      setState({ isLoading: false, vestings });
    },
    [state.vestings]
  );

  useEffect(() => {
    if (!chainId || !account || !vestingContracts?.length) return;

    setState({ isLoading: true });
    const multicall = new Multicall({
      ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
      tryAggregate: true
    });

    const contractCallContext: ContractCallContext[] = vestingContracts.reduce(
      (res, vestingContract) => [
        ...res,
        {
          reference: `withdrawn-${vestingContract.address}`,
          contractAddress: vestingContract.address,
          abi: VTVL_VESTING_ABI.abi,
          calls: [{ reference: 'getClaim', methodName: 'getClaim', methodParameters: [account] }]
        },
        {
          reference: `unclaimed-${vestingContract.address}`,
          contractAddress: vestingContract.address,
          abi: VTVL_VESTING_ABI.abi,
          calls: [{ reference: 'claimableAmount', methodName: 'claimableAmount', methodParameters: [account] }]
        }
      ],
      [] as ContractCallContext[]
    );

    multicall
      .call(contractCallContext)
      .then((response) => {
        const chainData: Array<{
          address: string;
          allocations: BigNumberish;
          locked: BigNumberish;
          withdrawn: BigNumberish;
          unclaimed: BigNumberish;
        }> = [];
        Object.keys(response.results).forEach((key) => {
          const value = response.results[key];
          const fields = key.split('-');
          const reference = fields[0];
          const address = fields[1];

          const index = chainData.findIndex(({ address: contractAddress }) =>
            compareAddresses(contractAddress, address)
          );
          const data =
            index > -1
              ? chainData[index]
              : {
                  allocations: BigNumber.from(0),
                  withdrawn: BigNumber.from(0),
                  unclaimed: BigNumber.from(0),
                  locked: BigNumber.from(0)
                };

          if (reference === 'withdrawn') {
            data.allocations = BigNumber.from(value.callsReturnContext[0].returnValues[TOTAL_ALLOCATION_AMOUNT_INDEX]);
            data.withdrawn = BigNumber.from(value.callsReturnContext[0].returnValues[WITHDRAWN_AMOUNT_INDEX]);
          } else {
            data.unclaimed = BigNumber.from(value.callsReturnContext[0].returnValues[0]);
          }

          if (index > -1) {
            chainData[index] = { address, ...data };
          } else {
            chainData.push({ address, ...data });
          }
        });

        setState({
          vestings: chainData.map((data) => {
            const locked = BigNumber.from(data.allocations)
              .sub(BigNumber.from(data.withdrawn))
              .sub(BigNumber.from(data.unclaimed));
            return {
              address: data.address,
              allocations: ethers.utils.formatEther(data.allocations.toString()),
              withdrawn: ethers.utils.formatEther(data.withdrawn.toString()),
              unclaimed: ethers.utils.formatEther(data.unclaimed.toString()),
              locked: ethers.utils.formatEther((locked.gte(0) ? locked : BigNumber.from(0)).toString())
            };
          })
        });
      })
      .catch(console.error)
      .finally(() => {
        setState({ isLoading: false });
      });
  }, [chainId, account, vestingContracts]);

  return { ...state, onUpdate: handleUpdate };
}
