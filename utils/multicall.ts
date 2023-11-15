import FACTORY_VESTING_ABI from 'contracts/abi/FactoryVesting.json';
import VTVL2_VESTING_ABI from 'contracts/abi/Vtvl2Vesting.json';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { IVestingContract } from 'interfaces/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { compareAddresses } from 'utils';

const LINEAR_AMOUNT_INDEX = 4;
const WITHDRAWN_AMOUNT_INDEX = 5;
const CLIFF_AMOUNT_INDEX = 6;
const V3_CONTRACT_AT = Number(process.env.NEXT_PUBLIC_V3_CONTRACT_AT) || 1698668802;

export function isV2(deployedAt: number | string) {
  let timestamp;
  if (typeof deployedAt == 'number') {
    timestamp = deployedAt;
  } else {
    timestamp = Math.floor(new Date(deployedAt).getTime() / 1000);
  }

  return timestamp >= Number(process.env.NEXT_PUBLIC_V2_CONTRACT_AT) && timestamp <= V3_CONTRACT_AT;
}

export function getVestingContractABI(deployedAt: string) {
  if (getVestingAbiIndex(deployedAt) === 3) {
    return FACTORY_VESTING_ABI;
  } else if (getVestingAbiIndex(deployedAt) === 2) {
    return VTVL2_VESTING_ABI.abi;
  } else {
    return VTVL_VESTING_ABI.abi;
  }
}

export function getVestingAbiIndex(deployedAt: string) {
  const deployedTime = Math.floor(new Date(deployedAt).getTime() / 1000);
  if (deployedTime > V3_CONTRACT_AT) {
    return 3;
  } else if (deployedTime >= Number(process.env.NEXT_PUBLIC_V2_CONTRACT_AT)) {
    return 2;
  } else {
    return 1;
  }
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
  contracts: IVestingContract[],
  operator: string
) => {
  const multicall = getMulticallInstance(chainId);
  const contractCallContext: ContractCallContext[] = contracts.reduce((res, contract) => {
    if (!contract.address) {
      return [...res];
    }

    return [
      ...res,
      // {
      //   reference: `withdrawn-${contract.address}`,
      //   contractAddress: contract.address,
      //   abi: getVestingContractABI(contract.updatedAt),
      //   calls:
      //     getVestingAbiIndex(contract.updatedAt) === 3
      //       ? [{ reference: 'getClaim', methodName: 'getClaim', methodParameters: [operator, 0] }]
      //       : [{ reference: 'getClaim', methodName: 'getClaim', methodParameters: [operator] }]
      // },
      {
        reference: `vested-${contract.address}`,
        contractAddress: contract.address,
        abi: getVestingContractABI(contract.updatedAt),
        calls: [
          {
            reference: 'vestedAmount',
            methodName: 'vestedAmount',
            methodParameters:
              getVestingAbiIndex(contract.updatedAt) === 3
                ? [operator, 0, Math.floor(new Date().getTime() / 1000)]
                : [operator, Math.floor(new Date().getTime() / 1000)]
          }
        ]
      },
      {
        reference: `final-${contract.address}`,
        contractAddress: contract.address,
        abi: getVestingContractABI(contract.updatedAt),
        calls: [
          {
            reference: 'finalClaimableAmount',
            methodName: 'finalClaimableAmount',
            methodParameters: getVestingAbiIndex(contract.updatedAt) === 3 ? [operator, 0] : [operator]
          }
        ]
      },
      {
        reference: `unclaimed-${contract.address}`,
        contractAddress: contract.address,
        abi: getVestingContractABI(contract.updatedAt),
        calls: [
          {
            reference: 'claimableAmount',
            methodName: 'claimableAmount',
            methodParameters: getVestingAbiIndex(contract.updatedAt) === 3 ? [operator, 0] : [operator]
          }
        ]
      }
    ];
  }, [] as ContractCallContext[]);

  const response = await multicall.call(contractCallContext);
  const chainData: Array<{
    address: string;
    finalClaimableAmount: BigNumberish;
    locked: BigNumberish;
    vestedAmount: BigNumberish;
    unclaimed: BigNumberish;
  }> = [];
  console.log({ contracts });
  Object.keys(response.results).forEach((key) => {
    const value = response.results[key];
    if (value.callsReturnContext[0].returnValues.length === 0) {
      return;
    }
    const fields = key.split('-');
    const reference = fields[0];
    const address = fields[1];

    const index = chainData.findIndex(({ address: contractAddress }) => compareAddresses(contractAddress, address));
    const data =
      index > -1
        ? chainData[index]
        : {
            finalClaimableAmount: BigNumber.from(0),
            vestedAmount: BigNumber.from(0),
            unclaimed: BigNumber.from(0),
            locked: BigNumber.from(0)
          };

    if (reference === 'vested') {
      // data.allocations = BigNumber.from(value.callsReturnContext[0].returnValues[LINEAR_AMOUNT_INDEX]).add(
      //   value.callsReturnContext[0].returnValues[CLIFF_AMOUNT_INDEX]
      // );
      // data.withdrawn = BigNumber.from(value.callsReturnContext[0].returnValues[WITHDRAWN_AMOUNT_INDEX]);
      data.vestedAmount = BigNumber.from(value.callsReturnContext[0].returnValues[0]);
    } else if (reference === 'unclaimed') {
      data.unclaimed = BigNumber.from(value.callsReturnContext[0].returnValues[0]);
    } else {
      data.finalClaimableAmount = BigNumber.from(value.callsReturnContext[0].returnValues[0]);
    }

    if (index > -1) {
      chainData[index] = { address, ...data };
    } else {
      chainData.push({ address, ...data });
    }
  });

  return chainData.map((data) => {
    // const locked = BigNumber.from(data.allocations)
    //   .sub(BigNumber.from(data.withdrawn))
    //   .sub(BigNumber.from(data.unclaimed));
    const locked = BigNumber.from(data.finalClaimableAmount).sub(BigNumber.from(data.vestedAmount));
    const withdrawn = BigNumber.from(data.vestedAmount).sub(BigNumber.from(data.unclaimed));

    return {
      address: data.address,
      allocations: ethers.utils.formatEther(data.finalClaimableAmount.toString()),
      withdrawn: ethers.utils.formatEther(withdrawn.toString()),
      unclaimed: ethers.utils.formatEther(data.unclaimed.toString()),
      locked: ethers.utils.formatEther((locked.gte(0) ? locked : BigNumber.from(0)).toString())
    };
  });
};
