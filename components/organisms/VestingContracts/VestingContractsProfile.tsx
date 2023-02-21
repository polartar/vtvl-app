import DashboardBarChart from '@components/molecules/DashboardBarChart';
import { BigNumber } from 'ethers';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import Image from 'next/image';
import { useMemo } from 'react';

import StandardCard from '../Cards/StandardCard';

interface IContractProfile {
  title: string;
  icon: any;
  content: number;
  isCaret?: boolean;
}

const VestingContractsProfile = ({
  vestingContractsInfo,
  vestingCount
}: {
  vestingContractsInfo: VestingContractInfo[];
  vestingCount?: number;
}) => {
  const cardsInfo = useMemo(() => {
    let items: IContractProfile[];
    if (vestingContractsInfo && vestingContractsInfo.length > 0) {
      items = [
        {
          title: vestingCount ? 'Vesting' : 'Contract',
          icon: <Image src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />,
          content: vestingCount || vestingContractsInfo.length,
          isCaret: true
        },
        {
          title: 'Withdrawn',
          icon: <div className="w-3 h-3 bg-yellow-200 rounded-full flex-shrink-0" />,
          content: 0
        },
        {
          title: 'Unclaimed',
          icon: <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />,
          content: 0
        },
        {
          title: 'Reserved',
          icon: <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0" />,
          content: 0
        },
        {
          title: 'Total locked',
          icon: <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />,
          content: 0
        },
        {
          title: 'Total allocation',
          icon: <img src="/icons/total-allocation.svg" />,
          content: 0
        }
      ];
      vestingContractsInfo.forEach((vesting) => {
        items[1].content += Number(vesting.withdrawn);
        items[2].content += Number(vesting.unclaimed);

        items[3].content += Number(vesting.reserved);
        items[4].content += Number(vesting.locked);
        items[5].content += Number(vesting.allocation);
      });
      return items;
    } else {
      return [];
    }
  }, [vestingContractsInfo]);
  return (
    <div className="w-full">
      <div className="grid  2xl:grid-cols-6 xl:grid-cols-3 md:grid-cols-2 gap-6">
        {cardsInfo.map((card) => {
          return (
            <StandardCard
              // isLoading={isLoadingDetails}
              key={card.title}
              icon={card.icon}
              title={card.title}
              content={String(card.content)}
              contentType="compact"
            />
          );
        })}
      </div>
      {cardsInfo && cardsInfo.length > 0 && (
        <DashboardBarChart
          totalAllocation={BigNumber.from(cardsInfo[5].content)}
          totalLocked={BigNumber.from(cardsInfo[4].content)}
          unlocked={BigNumber.from(cardsInfo[1].content).add(BigNumber.from(cardsInfo[2].content))}
          withdrawn={BigNumber.from(cardsInfo[1].content)}
        />
      )}
    </div>
  );
};

export default VestingContractsProfile;
