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
  const { vestingContracts, vestings, recipients } = useDashboardContext();
  const { mintFormState } = useTokenContext();

  const withdrawnPercentage =
    (parseFloat(ethers.utils.formatEther(withdrawn)) / parseFloat(ethers.utils.formatEther(totalAllocation))) * 100;
  const claimablePercecntage =
    (parseFloat(ethers.utils.formatEther(unlocked.sub(withdrawn))) /
      parseFloat(ethers.utils.formatEther(totalAllocation))) *
    100;
  const totalLockedPercentage = 100 - withdrawnPercentage - claimablePercecntage;

  return (
    <div className="w-full px-8 py-4 pb-8 mt-10 border-b border-info">
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
      <div className="mt-12 grid grid-cols-4 gap-6">
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Contracts</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{vestingContracts.length}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" />
        </div>
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Schedules</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{vestings.length}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" />
        </div>
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Recipients</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{recipients.length}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" />
        </div>
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Claimed</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">N/A</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" />
        </div>
      </div>
    </div>
  );
};

export default DashboardBarChart;
