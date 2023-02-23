import Copy from '@components/atoms/Copy/Copy';
import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { BigNumber } from 'ethers/lib/ethers';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PlusIcon from 'public/icons/plus.svg';
import React, { useMemo } from 'react';

import ContractsProfile from './VestingContractsProfile';
import VestingFilter from './Vestings';

export default function VestingContract({ vestingContractId }: { vestingContractId: string }) {
  const { vestings: allVestings, vestingContracts: allVestingContracts } = useDashboardContext();
  const { safe } = useAuthContext();

  const router = useRouter();
  const vestings = useMemo(() => {
    return allVestings.filter((vesting) => vesting.data.vestingContractId === vestingContractId);
  }, [allVestings]);

  const vestingContracts = useMemo(() => {
    const selectedVestingContract = allVestingContracts?.find((contract) => contract.id === vestingContractId);
    return selectedVestingContract ? [selectedVestingContract] : [];
  }, [allVestingContracts]);

  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(vestingContracts, allVestings);
  const vestingContractsInfo = useMemo(() => {
    if (!vestingSchedulesInfo || !vestingSchedulesInfo.length || !vestingContracts.length) return undefined;
    let allocation = BigNumber.from(0),
      unclaimed = BigNumber.from(0),
      withdrawn = BigNumber.from(0),
      locked = BigNumber.from(0);
    vestingSchedulesInfo.forEach((vesting) => {
      allocation = allocation.add(vesting.allocation);
      unclaimed = unclaimed.add(vesting.unclaimed);
      withdrawn = withdrawn.add(vesting.withdrawn);
      locked = locked.add(vesting.locked);
    });
    return {
      address: vestingSchedulesInfo[0].address,
      recipient: '',
      allocation: allocation,
      unclaimed: unclaimed,
      withdrawn: withdrawn,
      locked: locked,
      reserved: vestingSchedulesInfo.length
        ? BigNumber.from(vestingContracts[0]?.data.balance || '0').sub(
            vestingSchedulesInfo[0].numTokensReservedForVesting || '0'
          )
        : BigNumber.from(0)
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

      {vestingContractsInfo && (
        <ContractsProfile vestingContractsInfo={[vestingContractsInfo]} count={vestings.length} title="Schedule" />
      )}

      {vestingContracts[0] && (
        <VestingFilter
          vestings={vestings}
          vestingSchedulesInfo={vestingSchedulesInfo}
          totalBalance={vestingContracts[0].data.balance || '0'}
        />
      )}

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
    </div>
  );
}
