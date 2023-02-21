import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { ethers } from 'ethers';
import { BigNumber, BigNumberish } from 'ethers/lib/ethers';
import { useEffect } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting, IVestingContract } from 'types/models';
import { IRecipient } from 'types/vesting';
import { compareAddresses } from 'utils';

import { useShallowState } from './useShallowState';

const TOTAL_ALLOCATION_AMOUNT_INDEX = 4;
const WITHDRAWN_AMOUNT_INDEX = 5;
const CLIFF_AMOUNT_INDEX = 6;

export type VestingContractInfo = {
  address: string;
  recipient: string;
  unclaimed: string;
  allocation: string;
  withdrawn: string;
  locked: string;
  reserved?: string;
};

/**
 * Fetch on-chain vesting data
 */
export default function useChainVestingContracts(
  vestingContracts: { id: string; data: IVestingContract }[],
  vestings: { id: string; data: IVesting }[]
) {
  const { chainId } = useWeb3React();
  const [state, setState] = useShallowState<{
    isLoading: boolean;
    vestingSchedules: Array<VestingContractInfo>;
  }>({
    isLoading: false,
    vestingSchedules: []
  });

  useEffect(() => {
    if (!chainId || !vestingContracts?.length) return;

    setState({ isLoading: true });
    const multicall = new Multicall({
      ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
      tryAggregate: true
    });

    const contractCallContext: ContractCallContext[] = vestingContracts.reduce((res, vestingContract) => {
      const partialVestings = vestings.filter((vesting) => vesting.data.vestingContractId === vestingContract.id);

      let allRecipients: IRecipient[] = [];
      partialVestings.forEach((vesting) => {
        allRecipients = allRecipients.concat(vesting.data.recipients);
      });

      let result: ContractCallContext[] = [];
      allRecipients.forEach((recipient) => {
        result = result.concat([
          {
            reference: `withdrawn-${vestingContract.data.address}-${recipient.walletAddress}`,
            contractAddress: vestingContract.data.address,
            abi: VTVL_VESTING_ABI.abi,
            calls: [{ reference: 'getClaim', methodName: 'getClaim', methodParameters: [recipient.walletAddress] }]
          },
          {
            reference: `unclaimed-${vestingContract.data.address}-${recipient.walletAddress}`,
            contractAddress: vestingContract.data.address,
            abi: VTVL_VESTING_ABI.abi,
            calls: [
              {
                reference: 'claimableAmount',
                methodName: 'claimableAmount',
                methodParameters: [recipient.walletAddress]
              }
            ]
          }
        ]);
      });
      return [...res, ...result];
    }, [] as ContractCallContext[]);
    multicall
      .call(contractCallContext)
      .then((response) => {
        const chainData: Array<{
          address: string;
          recipient: string;
          unclaimed: BigNumberish;
          allocation: BigNumberish;
          withdrawn: BigNumberish;
          locked: BigNumberish;
        }> = [];
        Object.keys(response.results).forEach((key) => {
          const value = response.results[key];
          const fields = key.split('-');
          const address = fields[1];
          const reference = fields[0];
          const recipient = fields[2];

          const index = chainData.findIndex(
            (data) => compareAddresses(data.address, address) && compareAddresses(data.recipient, recipient)
          );

          const data =
            index > -1
              ? chainData[index]
              : {
                  allocation: BigNumber.from(0),
                  withdrawn: BigNumber.from(0),
                  unclaimed: BigNumber.from(0),
                  locked: BigNumber.from(0),
                  recipient
                };
          if (reference === 'withdrawn') {
            data.allocation = BigNumber.from(value.callsReturnContext[0].returnValues[TOTAL_ALLOCATION_AMOUNT_INDEX]);
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
          vestingSchedules: chainData.map((data) => {
            const locked = BigNumber.from(data.allocation)
              .sub(BigNumber.from(data.withdrawn))
              .sub(BigNumber.from(data.unclaimed));
            return {
              address: data.address,
              recipient: data.recipient,
              allocation: ethers.utils.formatEther(data.allocation.toString()),
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
  }, [chainId, vestingContracts]);

  return { ...state };
}
