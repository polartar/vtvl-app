import { Typography } from '@components/atoms/Typography/Typography';
import React, { useCallback, useRef } from 'react';
import Countdown from 'react-countdown';
import { truncateComma } from 'utils';
import { formatNumber } from 'utils/token';

import AllocationSummaryChart from './AllocationSummaryChart';

export interface VestingCardProps {
  title: string;
  percentage: number;
  startDate: string;
  endDate: string;
  unlockDate?: number;
  withdrawnAmount: string;
  unclaimedAmount: string;
  totalLockedAmount: string;
  disabled: boolean;
  buttonLabel: string;
  buttonAction?: () => void;
  className?: string;
}

const VestingSection: React.FC<{ title: string; description?: string; children?: React.ReactElement }> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="w-full">
      <Typography className="text-neutral-800 font-medium" size="body">
        {title}
      </Typography>
      <br />
      {description && (
        <Typography className="text-neutral-500 font-medium" size="caption">
          {description}
        </Typography>
      )}
      {children && <>{children}</>}
    </div>
  );
};

export default function VestingCard({
  title,
  percentage,
  startDate,
  endDate,
  unlockDate,
  withdrawnAmount,
  unclaimedAmount,
  totalLockedAmount,
  disabled = false,
  buttonLabel,
  buttonAction,
  className = ''
}: VestingCardProps) {
  const handleCountdownComplete = useCallback(() => {}, []);

  return (
    <div className={`w-full border border-primary-50 rounded-10 p-6 font-medium ${className}`}>
      <div className="flex items-center justify-between">
        <Typography variant="inter" size="paragraph" className="font-bold text-primary-900">
          {title}
        </Typography>
        <div className="flex items-center justify-end gap-4 min-w-100">
          <AllocationSummaryChart
            width={27}
            height={27}
            innerRadius={8}
            outerRadius={12}
            data={[
              {
                name: 'Done',
                value: percentage
              },
              {
                name: 'Pending',
                value: 100 - percentage
              }
            ]}
            colors={['#31cb9e', '#d0d5dd']}
          />
          <Typography variant="inter" size="caption" className="text-neutral-500">
            {percentage}/100%
          </Typography>
        </div>
      </div>
      <hr className="my-3 bg-neutral-200" />
      <div className="grid grid-cols-3 gap-4">
        <VestingSection title="Start date" description={startDate} />
        <VestingSection title="End date" description={endDate} />
        <VestingSection title="Next unlock" description={unlockDate ? '' : 'N/A'}>
          <>
            {unlockDate && (
              <Countdown
                date={unlockDate}
                renderer={({ days, hours, minutes, seconds }) => (
                  <Typography className="text-neutral-500 font-medium" size="caption">
                    {days}d {hours}h {minutes}m {seconds}s
                  </Typography>
                )}
                onComplete={handleCountdownComplete}
              />
            )}
          </>
        </VestingSection>
      </div>
      <hr className="my-3 bg-neutral-200" />
      <div className="grid grid-cols-3 gap-4">
        <VestingSection title="Withdrawn" description={String(formatNumber(Number(truncateComma(withdrawnAmount))))} />
        <VestingSection title="Unclaimed" description={String(formatNumber(Number(truncateComma(unclaimedAmount))))} />
        <VestingSection
          title="Total locked"
          description={String(formatNumber(Number(truncateComma(totalLockedAmount))))}
        />
      </div>
      <hr className="my-3 bg-neutral-200" />
      <button
        type="button"
        disabled={disabled}
        className="w-full bg-secondary-900 border border-secondary-900 rounded-8 p-1"
        onClick={buttonAction}>
        <Typography className="text-center text-white font-medium" size="base">
          {buttonLabel}
        </Typography>
      </button>
    </div>
  );
}
