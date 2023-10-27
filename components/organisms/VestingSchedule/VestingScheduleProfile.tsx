import DashboardBarChart from '@components/molecules/DashboardBarChart';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { BigNumber, ethers } from 'ethers';
import { Timestamp } from 'firebase/firestore';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import moment from 'moment';
import Image from 'next/image';
import { useMemo } from 'react';
import { IVesting } from 'types/models';
import { getActualDateTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import { BNToAmountString } from 'utils/web3';

import StandardCard from '../Cards/StandardCard';

interface IVestingScheduleProfile {
  title: string;
  icon?: React.ReactElement;
  content: string;
  data?: BigNumber;
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
          content: formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(vestingScheduleInfo.withdrawn)))),
          data: vestingScheduleInfo.withdrawn
        },
        {
          title: 'Unclaimed',
          icon: <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />,
          content: formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(vestingScheduleInfo.unclaimed)))),
          data: vestingScheduleInfo.unclaimed
        },
        {
          title: 'Total locked',
          icon: <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />,
          content: formatNumber(parseFloat(BNToAmountString(ethers.BigNumber.from(vestingScheduleInfo.locked)))),
          data: vestingScheduleInfo.locked
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
        moment((vesting.details.startDateTime as unknown as Timestamp).toDate().toString()),
        'months'
      );

      const actualDates = getActualDateTime(vesting.details);
      let progress = 0;
      if (actualDates.startDateTime && actualDates.endDateTime && vesting.status === 'LIVE') {
        const totalSeconds = differenceInSeconds(actualDates.endDateTime, actualDates.startDateTime);
        const secondsFromNow = differenceInSeconds(new Date(), actualDates.startDateTime);
        progress = Math.round((secondsFromNow / totalSeconds) * 100);
      }
      progress = progress >= 100 ? 100 : progress < 0 ? 0 : progress;

      items[7].content = `${progress}%`;

      const years = Math.floor(diff / 12);
      const months = diff - years * 12;
      items[9].content = years ? `${years} years ` : '';
      items[9].content += months ? `${months} months` : '';
      return items;
    } else {
      return [];
    }
  }, [vestingScheduleInfo]);

  return (
    <div className="w-full">
      <div className="grid  2xl:grid-cols-5 xl:grid-cols-5 md:grid-cols-4 gap-6">
        {cardsInfo.map((card) => {
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
          totalLocked={cardsInfo[3].data!}
          unlocked={cardsInfo[1].data!.add(cardsInfo[2].data!)}
          withdrawn={cardsInfo[1].data!}
        />
      )}
    </div>
  );
};

export default VestingScheduleProfile;
