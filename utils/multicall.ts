import VTVL2_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVestingContractDoc } from 'types/models/vestingContract';
import { compareAddresses } from 'utils';

export function isV2(deployedAt: number) {
  return deployedAt >= Number(process.env.NEXT_PUBLIC_V2_CONTRACT_AT);
}

export function getVestingContractABI(deployedAt: number) {
  return isV2(deployedAt) ? VTVL2_VESTING_ABI.abi : VTVL_VESTING_ABI.abi;
}
/**
 * Create multicall class instance
 */
export const getMulticallInstance = (chainId: SupportedChainId) => {
  return new Multicall({
    ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
    tryAggregate: true
  });
};

/**
 * Get vesting's claimableAmount from vesting contract
 */
export const getVestingDetailsFromContracts = async (
  chainId: SupportedChainId,
  contracts: IVestingContractDoc[],
  operator: string
) => {
  const multicall = getMulticallInstance(chainId);

  const contractCallContext: ContractCallContext[] = contracts.reduce(
    (res, contract) => [
      ...res,
      {
        reference: `withdrawn-${contract.data.address}`,
        contractAddress: contract.data.address,
        abi: getVestingContractABI(contract.data.updatedAt),
        calls: [{ reference: 'getClaim', methodName: 'getClaim', methodParameters: [operator] }]
      },
      {
        reference: `unclaimed-${contract.data.address}`,
        contractAddress: contract.data.address,
        abi: getVestingContractABI(contract.data.updatedAt),
        calls: [{ reference: 'claimableAmount', methodName: 'claimableAmount', methodParameters: [operator] }]
      }
    ],
    [] as ContractCallContext[]
  );

  const response = await multicall.call(contractCallContext);
  const chainData: Array<{
    address: string;
    allocations: BigNumberish;
    locked: BigNumberish;
    withdrawn: BigNumberish;
    unclaimed: BigNumberish;
    cliffAmount: BigNumberish;
  }> = [];

  Object.keys(response.results).forEach((key) => {
    const value = response.results[key];
    const fields = key.split('-');
    const reference = fields[0];
    const address = fields[1];

    const index = chainData.findIndex(({ address: contractAddress }) => compareAddresses(contractAddress, address));
    const data =
      index > -1
        ? chainData[index]
        : {
            allocations: BigNumber.from(0),
            withdrawn: BigNumber.from(0),
            unclaimed: BigNumber.from(0),
            locked: BigNumber.from(0),
            cliffAmount: BigNumber.from(0)
          };

    const contract = contracts.find((c) => compareAddresses(c.data.address, address));

    const LINEAR_AMOUNT_INDEX = 4;
    const WITHDRAWN_AMOUNT_INDEX = contract?.data.updatedAt && isV2(contract.data.updatedAt) ? 5 : 6;
    const CLIFF_AMOUNT_INDEX = contract?.data.updatedAt && isV2(contract.data.updatedAt) ? 6 : 5;

    if (reference === 'withdrawn') {
      data.allocations = BigNumber.from(value.callsReturnContext[0].returnValues[LINEAR_AMOUNT_INDEX]).add(
        value.callsReturnContext[0].returnValues[CLIFF_AMOUNT_INDEX]
      );
      data.withdrawn = BigNumber.from(value.callsReturnContext[0].returnValues[WITHDRAWN_AMOUNT_INDEX]);
      data.cliffAmount = BigNumber.from(value.callsReturnContext[0].returnValues[CLIFF_AMOUNT_INDEX]);
    } else {
      data.unclaimed = BigNumber.from(value.callsReturnContext[0].returnValues[0]);
    }

    if (index > -1) {
      chainData[index] = { address, ...data };
    } else {
      chainData.push({ address, ...data });
    }
  });

  return chainData.map((data) => {
    const locked = BigNumber.from(data.allocations)
      .sub(BigNumber.from(data.withdrawn))
      .sub(BigNumber.from(data.unclaimed));

    return {
      address: data.address,
      allocations: ethers.utils.formatEther(data.allocations.toString()),
      withdrawn: ethers.utils.formatEther(data.withdrawn.toString()),
      unclaimed: ethers.utils.formatEther(data.unclaimed.toString()),
      cliffAmount: ethers.utils.formatEther(data.cliffAmount.toString()),
      locked: ethers.utils.formatEther((locked.gte(0) ? locked : BigNumber.from(0)).toString())
    };
  });
};
