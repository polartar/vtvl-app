import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import getUnixTime from 'date-fns/getUnixTime';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers/lib/ethers';
import { useEffect } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting, IVestingContract } from 'types/models';
import { IRecipientDoc } from 'types/models/recipient';
import { compareAddresses } from 'utils';

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
  vestingContracts: { id: string; data: IVestingContract }[],
  vestings: { id: string; data: IVesting }[],
  recipients: IRecipientDoc[]
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

    const contractCallContext: ContractCallContext[] = vestingContracts
      .filter((vestingContract) => !!vestingContract.data.address)
      .reduce((res, vestingContract) => {
        const partialVestings = vestings
          .filter((vesting) => vesting.data.vestingContractId === vestingContract.id)
          .map((vesting) => vesting.id);
        const partialRecipients = recipients.filter(({ data: recipient }) =>
          partialVestings.includes(recipient.vestingId)
        );

        let result: ContractCallContext[] = [];
        result = result.concat({
          reference: `numTokensReservedForVesting-${vestingContract.data.address}`,
          contractAddress: vestingContract.data.address,
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
          .filter(({ data: recipient }) => !!recipient.walletAddress)
          .forEach(({ data: recipient }) => {
            result = result.concat([
              {
                reference: `multicall-${vestingContract.data.address}-${recipient.walletAddress}`,
                contractAddress: vestingContract.data.address,
                abi: VTVL_VESTING_ABI.abi,
                calls: [
                  {
                    // This gets the claimable amount by the recipient
                    reference: 'claimableAmount',
                    methodName: 'claimableAmount',
                    methodParameters: [recipient.walletAddress]
                  },
                  {
                    // This gets the total vested amount for the recipient (includes everything)
                    reference: 'finalVestedAmount',
                    methodName: 'finalVestedAmount',
                    methodParameters: [recipient.walletAddress]
                  },
                  {
                    // This gets the current vested amount as of date (currently unlocked tokens, both claimed and unclaimed)
                    reference: 'vestedAmount',
                    methodName: 'vestedAmount',
                    methodParameters: [recipient.walletAddress, getUnixTime(new Date())]
                  }
                  // { reference: 'getClaim', methodName: 'getClaim', methodParameters: [recipient.walletAddress] }
                ]
              }
            ]);
          });

        return [...res, ...result];
      }, [] as ContractCallContext[]);

    multicall
      .call(contractCallContext)
      .then((response) => {
        console.log('VESTING SCHEDULE DETAILS MULTICALL', response);
        // Set constants for referencing the calls based on the multicall setup above
        const CLAIMABLE_AMOUNT_CALL = 0;
        const FINAL_VESTED_AMOUNT_CALL = 1;
        const VESTED_AMOUNT_CALL = 2;

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
            // Gets the total allocation of the recipient
            const finalVestedAmount = record[FINAL_VESTED_AMOUNT_CALL].returnValues[0];
            // Gets the vested amount of the recipient -- which is the claimed and unclaimed tokens
            const vestedAmount = record[VESTED_AMOUNT_CALL].returnValues[0];
            // Computes the actual withdrawn amount by getting the claimed tokens
            // unclaimed = claimableAmount
            // claimed = vested amount - unclaimed
            const claimedAmount = ethers.BigNumber.from(vestedAmount).gt(claimableAmount)
              ? ethers.BigNumber.from(vestedAmount).sub(claimableAmount)
              : ethers.BigNumber.from(0);

            // Computes the locked tokens of the recipient
            const lockedTokens = ethers.BigNumber.from(finalVestedAmount).sub(claimedAmount).sub(claimableAmount);
            data.allocation = BigNumber.from(finalVestedAmount);
            data.withdrawn = BigNumber.from(claimedAmount);
            data.unclaimed = BigNumber.from(claimableAmount);
            data.locked = BigNumber.from(lockedTokens);
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
  }, [chainId, vestingContracts, recipients]);

  return { ...state };
}
