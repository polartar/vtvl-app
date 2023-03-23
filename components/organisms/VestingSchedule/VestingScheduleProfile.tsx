import DashboardBarChart from '@components/molecules/DashboardBarChart';
import { BigNumber, ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import moment from 'moment';
import Image from 'next/image';
import { useMemo } from 'react';
import { IVesting } from 'types/models';
import { formatNumber } from 'utils/token';

import StandardCard from '../Cards/StandardCard';

interface IVestingScheduleProfile {
  title: string;
  icon?: React.ReactElement;
  content: string;
  isCaret?: boolean;
}

const VestingScheduleProfile = ({
  vestingScheduleInfo,
  count,
  title,
  vesting
}: {
  vestingScheduleInfo: VestingContractInfo;
  count: number;
  title: string;
  vesting: IVesting;
}) => {
  const cardsInfo = useMemo(() => {
    let items: IVestingScheduleProfile[];
    if (vestingScheduleInfo) {
      items = [
        {
          title: title,
          icon: <Image src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />,
          content: count.toString(),
          isCaret: true
        },
        {
          title: 'Withdrawn',
          icon: <div className="w-3 h-3 bg-yellow-200 rounded-full flex-shrink-0" />,
          content: Number(formatEther(vestingScheduleInfo.withdrawn)).toFixed(2)
        },
        {
          title: 'Unclaimed',
          icon: <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />,
          content: Number(formatEther(vestingScheduleInfo.unclaimed)).toFixed(2)
        },
        {
          title: 'Total locked',
          icon: <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />,
          content: Number(formatEther(vestingScheduleInfo.locked)).toFixed(2)
        },
        {
          title: 'Total allocation',
          icon: <img src="/icons/total-allocation.svg" />,
          content: formatNumber(vesting.details.amountToBeVested)
        },
        {
          title: 'Start',
          content: moment((vesting.details.startDateTime as unknown as Timestamp).toDate().toString()).format(
            'MMM D, YYYY'
          ),
          isCaret: true
        },
        {
          title: 'End',
          icon: <div className="w-3 h-3 bg-yellow-200 rounded-full flex-shrink-0" />,
          content: moment((vesting.details.endDateTime as unknown as Timestamp).toDate().toString()).format(
            'MMM D, YYYY'
          )
        },
        {
          title: 'Progress',
          icon: <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />,
          content: '0/100%'
        },
        {
          title: 'Cliff release',
          icon: <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />,
          content: vesting.details.cliffDuration.split('-').join(' ')
        },
        {
          title: 'Vesting period',
          icon: <img src="/icons/total-allocation.svg" />,
          content: ''
        }
      ];
      const diff = moment((vesting.details.endDateTime as unknown as Timestamp).toDate().toString()).diff(
        moment((vesting.details.startDateTime as unknown as Timestamp).toDate().toString()),
        'months'
      );
      const diffFromNow = moment().diff(
        moment((vesting.details.startDateTime as unknown as Timestamp).toDate().toString())
      );

      let progress =
        vesting.status === 'LIVE' && diffFromNow >= 0 ? Math.floor((diffFromNow / diff) * 100).toString() : 0;
      if (progress > 100) progress = 100;
      items[7].content = `${progress}/100%`;

      const years = Math.floor(diff / 12);
      const months = diff - years * 12;
      items[9].content = years ? `${years} years ` : '';
      items[9].content += months ? `${months} months` : '';
      return items;
    } else {
      return [];
    }
  }, [vestingScheduleInfo]);
  console.log(cardsInfo);
  return (
    <div className="w-full">
      <div className="grid  2xl:grid-cols-5 xl:grid-cols-5 md:grid-cols-4 gap-6">
        {cardsInfo.map((card, index) => {
          return (
            <StandardCard
              // isLoading={isLoadingDetails}
              key={card.title}
              icon={card.icon}
              title={card.title}
              content={card.content}
              contentType="text"
            />
          );
        })}
      </div>
      {cardsInfo && cardsInfo.length > 0 && (
        <DashboardBarChart
          totalAllocation={BigNumber.from(ethers.utils.parseUnits(vesting.details.amountToBeVested.toString(), 18))}
          totalLocked={BigNumber.from(ethers.utils.parseUnits(cardsInfo[3].content, 18))}
          unlocked={BigNumber.from(ethers.utils.parseUnits(cardsInfo[1].content, 18)).add(
            BigNumber.from(ethers.utils.parseUnits(cardsInfo[2].content, 18))
          )}
          withdrawn={BigNumber.from(ethers.utils.parseUnits(cardsInfo[1].content, 18))}
        />
      )}
    </div>
  );
};

export default VestingScheduleProfile;
