import Copy from '@components/atoms/Copy/Copy';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ethers } from 'ethers';
import { BigNumber, BigNumberish } from 'ethers/lib/ethers';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import React, { useMemo } from 'react';
import useSWR from 'swr';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

import ContractsProfile from './VestingContractsProfile';
import VestingFilter from './Vestings';

export interface IBalanceInfo {
  tokenBalance: BigNumberish;
  numberOfTokensReservedForVesting: BigNumberish;
}
export default function VestingContract({ vestingContractId }: { vestingContractId: string }) {
  const { vestings: allVestings, vestingContracts: allVestingContracts } = useDashboardContext();
  const { safe } = useAuthContext();
  const { chainId } = useWeb3React();

  const router = useRouter();
  const vestings = useMemo(() => {
    return allVestings.filter((vesting) => vesting.data.vestingContractId === vestingContractId);
  }, [allVestings]);

  const vestingContracts = useMemo(() => {
    const selectedVestingContract = allVestingContracts?.find((contract) => contract.id === vestingContractId);
    return selectedVestingContract ? [selectedVestingContract] : [];
  }, [allVestingContracts]);

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(vestingContracts, allVestings);

  const { data: balanceInfo } = useSWR(vestingContractId, async () => {
    if (vestingContracts.length === 0) {
      return {
        tokenBalance: BigNumber.from('0'),
        numberOfTokensReservedForVesting: BigNumber.from('0')
      };
    }
    const vestingContract = vestingContracts[0];
    const VestingContract = new ethers.Contract(
      vestingContract?.data.address || '',
      VTVL_VESTING_ABI.abi,
      ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
    );
    const tokenBalance = vestingContract.data.balance || 0;

    const numberOfTokensReservedForVesting: BigNumberish = await VestingContract.numTokensReservedForVesting();
    return {
      tokenBalance: BigNumber.from(tokenBalance),
      numberOfTokensReservedForVesting
    };
  });
  const vestingContractsInfo = useMemo(() => {
    if (!vestingSchedulesInfo || !vestingSchedulesInfo.length || !vestingContracts.length) return undefined;
    let allocation = 0,
      unclaimed = 0,
      withdrawn = 0,
      locked = 0;
    vestingSchedulesInfo.forEach((vesting) => {
      allocation += Number(vesting.allocation);
      unclaimed += Number(vesting.unclaimed);
      withdrawn += Number(vesting.withdrawn);
      locked += Number(vesting.locked);
    });
    return {
      address: vestingSchedulesInfo[0].address,
      recipient: '',
      allocation: allocation.toString(),
      unclaimed: unclaimed.toString(),
      withdrawn: withdrawn.toString(),
      locked: locked.toString(),
      reserved: (
        Number(ethers.utils.formatEther(vestingContracts[0]?.data.balance || '0')) -
        withdrawn +
        unclaimed
      ).toString()
    };
  }, [vestingSchedulesInfo, vestingContracts]);
  return (
    <div className="w-full">
      <div className="mb-9">
        <div className="flex justify-between">
          <Typography size="title" variant="inter" className=" font-semibold text-neutral-900 ">
            Contract
          </Typography>
          <button className="primary row-center" onClick={() => router.push('/vesting-schedule/add-recipients')}>
            <PlusIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">Create</span>
          </button>
        </div>

        <div className="flex items-center mt-2">
          {safe?.address && (
            <>
              <Image src={'/icons/safe.png'} alt="token-image" width={18} height={18} />
              <Typography size="base" variant="inter" className=" font-medium text-neutral-900 ml-2 mr-9">
                {safe.org_name}
              </Typography>
            </>
          )}

          <Copy text={vestingContracts[0]?.data.address || ''}>
            <p className="paragraphy-small ">
              {vestingContracts[0]?.data.address.slice(0, 5)}...{vestingContracts[0]?.data.address.slice(-4)}
            </p>
          </Copy>
        </div>
      </div>
      {vestings.length === 0 ? (
        <div className="flex justify-center">No vestings</div>
      ) : (
        <>
          {vestingContractsInfo && (
            <ContractsProfile vestingContractsInfo={[vestingContractsInfo]} vestingCount={vestings.length} />
          )}

          <VestingFilter
            vestings={vestings}
            vestingSchedulesInfo={vestingSchedulesInfo}
            balanceInfo={balanceInfo as IBalanceInfo}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6 px-6">
            {!vestingContracts.length ? (
              Array.from(new Array(3)).map((_, index) => (
                <div key={index} className="animate-pulse w-full">
                  <div className="w-full h-368 bg-neutral-100 rounded-10"></div>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
}
