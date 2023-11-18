import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers/lib/ethers';
import { IVestingContract } from 'interfaces/vestingContract';
import { useEffect } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting } from 'types/models';
import { IRecipient } from 'types/models/recipient';
import { compareAddresses } from 'utils';
import { getVestingAbiIndex, getVestingContractABI } from 'utils/multicall';

import { useShallowState } from './useShallowState';

export type VestingContractInfo = {
  address: string;
  recipient: string;
  unclaimed: BigNumber;
  allocation: BigNumber;
  withdrawn: BigNumber;
  locked: BigNumber;
  reserved?: BigNumber;
  numTokensReservedForVesting?: BigNumber;
};

/**
 * Fetch on-chain vesting data
 */
export default function useChainVestingContracts(
  vestingContracts: IVestingContract[],
  vestings: { id: string; data: IVesting }[],
  recipients: IRecipient[]
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
    const debounce = setTimeout(() => {
      const arrVestingContracts = Array.isArray(vestingContracts) ? vestingContracts : [vestingContracts];
      const filteredContracts = arrVestingContracts.filter((contract) => !!contract.address);
      if (!chainId || !filteredContracts?.length) return;

      const multicall = new Multicall({
        ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
        tryAggregate: true
      });

      const contractCallContext: ContractCallContext[] = filteredContracts.reduce((res, vestingContract) => {
        let result: ContractCallContext[] = [];
        if (vestingContract.address) {
          const partialVestings = vestings
            .filter((vesting) => vesting.data.vestingContractId === vestingContract.id)
            .map((vesting) => vesting.id);
          const partialRecipients = recipients.filter((recipient) => partialVestings.includes(recipient.vestingId));

          result = result.concat({
            reference: `numTokensReservedForVesting-${vestingContract.address}`,
            contractAddress: vestingContract.address,
            abi: VTVL_VESTING_ABI.abi,
            calls: [
              {
                reference: 'numTokensReservedForVesting',
                methodName: 'numTokensReservedForVesting',
                methodParameters: []
              }
            ]
          });

          partialRecipients
            .filter((recipient) => !!recipient.address)
            .forEach((recipient) => {
              if (vestingContract.address) {
                result = result.concat([
                  {
                    reference: `multicall-${vestingContract.address}-${recipient.address}`,
                    contractAddress: vestingContract.address,
                    abi: getVestingContractABI(vestingContract.updatedAt),
                    calls:
                      getVestingAbiIndex(vestingContract.updatedAt) === 3
                        ? [
                            {
                              //   // This gets the claimable amount by the recipient
                              reference: 'claimableAmount',
                              methodName: 'claimableAmount',
                              methodParameters: [recipient.address, 0]
                            },
                            {
                              reference: 'vestedAmount',
                              methodName: 'vestedAmount',
                              methodParameters: [recipient.address, 0, Math.floor(new Date().getTime() / 1000)]
                            },
                            {
                              reference: 'finalClaimableAmount',
                              methodName: 'finalClaimableAmount',
                              methodParameters: [recipient.address, 0]
                            }
                          ]
                        : [
                            {
                              //   // This gets the claimable amount by the recipient
                              reference: 'claimableAmount',
                              methodName: 'claimableAmount',
                              methodParameters: [recipient.address]
                            },

                            {
                              reference: 'vestedAmount',
                              methodName: 'vestedAmount',
                              methodParameters: [recipient.address, Math.floor(new Date().getTime() / 1000)]
                            },
                            {
                              reference: 'finalClaimableAmount',
                              methodName: 'finalClaimableAmount',
                              methodParameters: [recipient.address]
                            }
                          ]
                  }
                ]);
              }
            });
        }
        return [...res, ...result];
      }, [] as ContractCallContext[]);

      multicall
        .call(contractCallContext)
        .then((response) => {
          // Set constants for referencing the calls based on the multicall setup above
          const WITHDRAWN_CALL = 1;
          const CLAIMABLE_AMOUNT_CALL = 0;

          const chainData: Array<{
            address: string;
            recipient: string;
            unclaimed: BigNumber;
            allocation: BigNumber;
            withdrawn: BigNumber;
            numTokensReservedForVesting: BigNumber;
            locked: BigNumber;
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
                    numTokensReservedForVesting: BigNumber.from(0),
                    recipient
                  };

            if (reference === 'numTokensReservedForVesting') {
              data.numTokensReservedForVesting = BigNumber.from(value.callsReturnContext[0].returnValues[0]);
            } else {
              const record = value.callsReturnContext;
              // Gets the claimable amount of the recipient
              const claimableAmount = record[CLAIMABLE_AMOUNT_CALL].returnValues[0];
              const vestedAmount = record[1].returnValues[0];
              const finalClaimableAmount = record[2].returnValues[0];

              // Gets the total allocation of the recipient
              // Gets the vested amount of the recipient -- which is the claimed and unclaimed tokens
              // Computes the actual withdrawn amount by getting the claimed tokens
              // unclaimed = claimableAmount
              // claimed = vested amount - unclaimed
              // const claimedAmount = record[WITHDRAWN_CALL].returnValues[5];
              // const linearAmount = record[WITHDRAWN_CALL].returnValues[4];
              // const cliffAmount = record[WITHDRAWN_CALL].returnValues[6];
              // const totalAllocation = BigNumber.from(linearAmount).add(cliffAmount);

              // Computes the locked tokens of the recipient
              const lockedTokens = BigNumber.from(finalClaimableAmount).sub(vestedAmount);
              data.allocation = finalClaimableAmount;
              data.withdrawn = BigNumber.from(vestedAmount).sub(claimableAmount);
              data.unclaimed = BigNumber.from(claimableAmount);
              data.locked = lockedTokens;
            }

            if (index > -1) {
              chainData[index] = { address, ...data };
            } else {
              chainData.push({ address, ...data });
            }
          });

          setState({
            vestingSchedules: chainData.map((data) => {
              // const locked = BigNumber.from(data.allocation)
              //   .sub(BigNumber.from(data.withdrawn))
              //   .sub(BigNumber.from(data.unclaimed));
              return {
                address: data.address,
                recipient: data.recipient,
                allocation: data.allocation,
                withdrawn: data.withdrawn,
                unclaimed: data.unclaimed,
                numTokensReservedForVesting: data.numTokensReservedForVesting,
                locked: data.locked.gte(0) ? data.locked : BigNumber.from(0)
              };
            })
          });
        })
        .catch(console.error)
        .finally(() => {
          setState({ isLoading: false });
        });
    }, 600);

    return () => clearTimeout(debounce);
  }, [chainId, vestingContracts, recipients]);

  return { ...state };
}
