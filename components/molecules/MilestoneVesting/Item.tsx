import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import { Typography } from '@components/atoms/Typography/Typography';
import FlagIcon from 'public/icons/flag.svg';
import { useCallback } from 'react';
import Countdown from 'react-countdown';

import MilestoneVestingProgress from './Progress';

export interface IMilestoneVestingItemProps {
  active?: boolean;
  title: string;
  description?: string;
  totalAllocation?: string; // the total allocation of the whole milestone vesting
  allocation: string; // the allocation specific to this milestone,
  releaseFrequency: string;
  releaseAmount: string;
  duration: string;
  unlockDate: number;
  remaining: string;
  released: string;
  totalMonths: number;
  progress: number;
  actions?: JSX.Element;
}

const MilestoneVestingItem = ({ active = false, ...props }: IMilestoneVestingItemProps) => {
  const handleCountdownComplete = useCallback(() => {}, []);
  return (
    <div>
      <FlagIcon className="w-[22px] text-primary-900 mb-2" />
      <Typography className="font-bold text-primary-900">{props.title}</Typography>
      {active && props.description ? (
        <p className="mt-1 text-xs text-neutral-700 leading-snug">{props.description}</p>
      ) : null}
      <div className="grid grid-cols-3 gap-3 mt-4 mb-3">
        <div className="flex flex-col gap-0.5">
          <Typography size="caption" className="text-neutral-400 font-medium">
            Duration
          </Typography>
          <Typography size="caption" className="text-neutral-800 font-medium">
            {props.duration}
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Typography size="caption" className="text-neutral-400 font-medium">
            Allocation
          </Typography>
          <Typography size="caption" className="text-neutral-800 font-medium">
            {props.allocation}
          </Typography>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <Typography size="caption" className="text-neutral-400 font-medium">
            Release Frequency
          </Typography>
          <div className="flex flex-row gap-2">
            <Typography size="caption" className="text-neutral-800 font-medium">
              {props.releaseAmount}
            </Typography>
            <Chip label={props.releaseFrequency} color="primary" size="tiny" />
          </div>
        </div>
        {active ? (
          <>
            <div className="flex flex-col gap-0.5">
              <Typography size="caption" className="text-neutral-400 font-medium">
                Next Unlock
              </Typography>
              <Typography size="caption" className="text-neutral-800 font-medium">
                <Countdown
                  date={props.unlockDate}
                  renderer={({ days, hours, minutes, seconds }) => (
                    <Typography className="text-neutral-500 font-medium" size="caption">
                      {days}d {hours}h {minutes}m {seconds}s
                    </Typography>
                  )}
                  onComplete={handleCountdownComplete}
                />
              </Typography>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Typography size="caption" className="text-neutral-400 font-medium">
                Remaining
              </Typography>
              <Typography size="caption" className="text-neutral-800 font-medium">
                {props.remaining}
              </Typography>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <Typography size="caption" className="text-neutral-400 font-medium">
                Released
              </Typography>
              <Typography size="caption" className="text-neutral-800 font-medium">
                {props.released}
              </Typography>
            </div>
          </>
        ) : null}
      </div>
      {active ? (
        <>
          <div>
            <Typography size="caption" className="text-primary-900 font-bold">
              Progress
            </Typography>
            <div className="mt-2">
              <MilestoneVestingProgress value={props.progress} total={props.totalMonths} />
            </div>
          </div>
          {props.actions ? <div className="flex flex-row items-center gap-2 mt-5">{props.actions}</div> : null}
        </>
      ) : null}
    </div>
  );
};

export default MilestoneVestingItem;
