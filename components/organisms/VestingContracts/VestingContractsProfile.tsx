import DashboardBarChart from '@components/molecules/DashboardBarChart';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import Image from 'next/image';
import { useMemo } from 'react';

import StandardCard from '../Cards/StandardCard';

interface IContractProfile {
  title: string;
  icon: any;
  content: BigNumber;
  isCaret?: boolean;
}

const VestingContractsProfile = ({
  vestingContractsInfo,
  count,
  title,
  showWithdrawn = true,
  showUnclaimed = true,
  showUnallocated = true,
  showLocked = true,
  showTotalAllocation = true
}: {
  vestingContractsInfo: VestingContractInfo[];
  count: number;
  title: string;
  showWithdrawn?: boolean;
  showUnclaimed?: boolean;
  showUnallocated?: boolean;
  showLocked?: boolean;
  showTotalAllocation?: boolean;
}) => {
  const cardsInfo = useMemo(() => {
    let items: IContractProfile[];
    if (vestingContractsInfo && vestingContractsInfo.length > 0) {
      items = [
        {
          title: title,
          icon: <Image src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />,
          content: BigNumber.from(count),
          isCaret: true
        },
        {
          title: 'Withdrawn',
          icon: <div className="w-3 h-3 bg-yellow-200 rounded-full flex-shrink-0" />,
          content: BigNumber.from(0)
        },
        {
          title: 'Unclaimed',
          icon: <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />,
          content: BigNumber.from(0)
        },
        {
          title: 'Unallocated',
          icon: <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0" />,
          content: BigNumber.from(0)
        },
        {
          title: 'Total locked',
          icon: <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />,
          content: BigNumber.from(0)
        },
        {
          title: 'Total allocation',
          icon: <img src="/icons/total-allocation.svg" />,
          content: BigNumber.from(0)
        }
      ];
      vestingContractsInfo.forEach((vesting) => {
        items[1].content = items[1].content.add(vesting.withdrawn);
        items[2].content = items[2].content.add(vesting.unclaimed);
        items[3].content = items[3].content.add(vesting.reserved ? vesting.reserved : 0);
        items[4].content = items[4].content.add(vesting.locked);
        items[5].content = items[5].content.add(vesting.allocation);
      });
      return items;
    } else {
      return [];
    }
  }, [vestingContractsInfo]);

  const filteredCards = cardsInfo.filter((card, cardIndex) => {
    if (cardIndex === 0) return true;
    if (card.title.toLowerCase() === 'withdrawn' && showWithdrawn) return true;
    if (card.title.toLowerCase() === 'unclaimed' && showUnclaimed) return true;
    if (card.title.toLowerCase() === 'unallocated' && showUnallocated) return true;
    if (card.title.toLowerCase() === 'total locked' && showLocked) return true;
    if (card.title.toLowerCase() === 'total allocation' && showTotalAllocation) return true;
    return false;
  });

  return (
    <div className="w-full">
      <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 md:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => {
          return (
            <StandardCard
              // isLoading={isLoadingDetails}
              key={card.title}
              icon={card.icon}
              title={card.title}
              content={index === 0 ? card.content.toString() : Number(formatEther(card.content)).toFixed(2)}
              contentType="compact"
            />
          );
        })}
      </div>
      {cardsInfo && cardsInfo.length > 0 && (
        <DashboardBarChart
          totalAllocation={cardsInfo[5].content}
          totalLocked={cardsInfo[4].content}
          unlocked={cardsInfo[1].content.add(cardsInfo[2].content)}
          withdrawn={cardsInfo[1].content}
        />
      )}
    </div>
  );
};

export default VestingContractsProfile;
