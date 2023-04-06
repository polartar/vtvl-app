import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { ethers } from 'ethers';
import React from 'react';
import { formatNumber } from 'utils/token';
import { BNToAmountString } from 'utils/web3';

interface IDashboardBarChart {
  totalAllocation: ethers.BigNumber;
  totalLocked: ethers.BigNumber;
  unlocked: ethers.BigNumber;
  withdrawn: ethers.BigNumber;
}

const DashboardBarChart: React.FC<IDashboardBarChart> = ({ totalAllocation, totalLocked, unlocked, withdrawn }) => {
  const { mintFormState } = useTokenContext();

  const withdrawnPercentage =
    (parseFloat(ethers.utils.formatEther(withdrawn)) / parseFloat(ethers.utils.formatEther(totalAllocation))) * 100;
  const claimablePercecntage =
    (parseFloat(ethers.utils.formatEther(unlocked.sub(withdrawn))) /
      parseFloat(ethers.utils.formatEther(totalAllocation))) *
    100;
  const totalLockedPercentage = 100 - withdrawnPercentage - claimablePercecntage;

  return (
    <div className="w-full py-10">
      <div className="flex rounded-xl relative">
        <div
          style={{ width: `${withdrawnPercentage}%`, backgroundColor: '#f9e597' }}
          className={`h-10 rounded-l-lg border-t-2 border-l-2 border-b-2 border-[#d0d5dd]`}
        />
        <div
          style={{ width: `${claimablePercecntage}%`, backgroundColor: '#50e8b4' }}
          className={`h-10 border-t-2 border-b-2 border-[#d0d5dd]`}
        />
        <div
          style={{ width: `${totalLockedPercentage}%`, backgroundColor: '#008ffb' }}
          className={`h-10 rounded-r-lg border-t-2 border-r-2 border-b-2 border-[#d0d5dd]`}
        />
        <div
          style={{ width: `${withdrawnPercentage + claimablePercecntage}%` }}
          className="flex items-center absolute left-0 -top-5 text-xs font-medium">
          <div
            style={{
              width: '1px',
              height: '10px',
              backgroundColor: '#d0d5dd'
            }}
          />
          <div
            style={{
              height: '1px',
              backgroundColor: '#d0d5dd'
            }}
            className="flex-grow mr-2"
          />
          <div className="mr-2">
            Unlocked&nbsp;&nbsp;{' '}
            <span style={{ color: '#98a2b3' }}>
              {formatNumber(parseFloat(BNToAmountString(unlocked)))}&nbsp;{mintFormState.symbol}
            </span>
          </div>
          <div
            style={{
              height: '1px',
              backgroundColor: '#d0d5dd'
            }}
            className="flex-grow"
          />
          <div
            style={{
              width: '1px',
              height: '10px',
              backgroundColor: '#d0d5dd'
            }}
          />
        </div>
        <div className="w-full flex items-center absolute left-0 -bottom-5 text-xs font-medium">
          <div
            style={{
              width: '1px',
              height: '10px',
              backgroundColor: '#d0d5dd'
            }}
          />
          <div
            style={{
              height: '1px',
              backgroundColor: '#d0d5dd'
            }}
            className="flex-grow mr-2"
          />
          <div className="mr-2">
            Total allocation&nbsp;&nbsp;{' '}
            <span style={{ color: '#98a2b3' }}>
              {formatNumber(parseFloat(BNToAmountString(totalAllocation)))}&nbsp;{mintFormState.symbol}
            </span>
          </div>
          <div
            style={{
              height: '1px',
              backgroundColor: '#d0d5dd'
            }}
            className="flex-grow"
          />
          <div
            style={{
              width: '1px',
              height: '10px',
              backgroundColor: '#d0d5dd'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardBarChart;
