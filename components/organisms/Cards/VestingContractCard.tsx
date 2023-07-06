import Button from '@components/atoms/Button/Button';
import Copy from '@components/atoms/Copy/Copy';
import { Typography } from '@components/atoms/Typography/Typography';
import Image from 'next/image';
import React from 'react';
import { truncateComma } from 'utils';
import { formatNumber } from 'utils/token';

import AllocationSummaryChart from './AllocationSummaryChart';

export interface VestingContractCardProps {
  title: string;
  address: string;
  totalAllocation: string;
  withdrawnAmount: string;
  unclaimedAmount: string;
  totalLockedAmount: string;
  buttonLabel: string;
  buttonAction?: () => void;
  className?: string;
}

const VestingSection: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className=" w-fit text-right">
      <Typography className="text-neutral-600 font-medium" size="body">
        {title}
      </Typography>
      <br />
      <Typography className="text-neutral-900 font-medium" size="caption">
        {description}
      </Typography>
    </div>
  );
};

export default function VestingContractCard({
  title,
  address,
  totalAllocation,
  withdrawnAmount,
  unclaimedAmount,
  totalLockedAmount,
  buttonLabel,
  buttonAction,
  className = ''
}: VestingContractCardProps) {
  return (
    <div className={`w-full min-h-[272px] border border-primary-50 rounded-10 p-6 font-medium ${className}`}>
      <div className="flex items-center mt-2 justify-between mb-3">
        <div>
          <Image src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />
          <Typography size="subtitle" variant="inter" className=" font-bold text-[#1b369a] ml-2 mr-9">
            {title}
          </Typography>
        </div>
        {address ? (
          <Copy text={address || ''}>
            <p className="paragraph-small ">
              {address.slice(0, 5)}...{address.slice(-4)}
            </p>
          </Copy>
        ) : (
          <Typography>Not deployed</Typography>
        )}
      </div>
      <Typography size="caption" variant="inter" className=" font-medium text-neutral-500  mr-9">
        Total Allocation
      </Typography>
      <br></br>
      <Typography size="subtitle" variant="inter" className=" font-medium   mr-9">
        {totalAllocation}
      </Typography>
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
        className="px-5 bg-primary-900 border border-primary-900 rounded-8 p-1"
        onClick={buttonAction}>
        <Typography className="text-center text-white font-medium" size="base">
          {buttonLabel}
        </Typography>
      </button>
    </div>
  );
}
