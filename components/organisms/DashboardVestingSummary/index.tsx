import DashboardBarChart from '@components/molecules/DashboardBarChart';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import React from 'react';
import { formatNumber } from 'utils/token';
import { BNToAmountString } from 'utils/web3';

const DashboardVestingSummary = () => {
  const { vestingContracts, vestings, recipientTokenDetails, totalAllocation, totalClaimable, totalWithdrawn, claims } =
    useDashboardContext();
  const { mintFormState } = useTokenContext();

  return (
    <div className="border-b border-info pb-8">
      <div className="p-6 flex justify-between border-t border-b border-info">
        <div>
          <div className="text-label text-sm font-medium flex items-center gap-1.5">
            <img src="/icons/total-allocation.svg" />
            Total allocation
          </div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalAllocation)))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f9e597]" />
            Withdrawn
          </div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalWithdrawn)))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e396]" />
            Unclaimed
          </div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalClaimable)))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008ffb]" />
            Total locked
          </div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalAllocation.sub(totalWithdrawn).sub(totalClaimable))))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium">Maximum Supply</div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {mintFormState.supplyCap === 'UNLIMITED' ? 'Unlimited' : formatNumber(+(mintFormState.maxSupply ?? '0'))}
          </div>
        </div>
      </div>
      {totalAllocation.gt(ethers.BigNumber.from(0)) && (
        <DashboardBarChart
          totalAllocation={totalAllocation}
          totalLocked={totalAllocation.sub(totalWithdrawn).sub(totalClaimable)}
          unlocked={totalWithdrawn.add(totalClaimable)}
          withdrawn={totalWithdrawn}
        />
      )}
      <div className="mt-4 grid grid-cols-4 gap-6 px-6">
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Contracts</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{vestingContracts.length}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" aria-hidden="true" />
        </div>
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Schedules</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{vestings.length}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" aria-hidden="true" />
        </div>
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Recipients</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">
              {recipientTokenDetails.length}
            </div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" aria-hidden="true" />
        </div>
        <div className="w-full px-6 py-3 flex items-end justify-between border border-[#e8ebf5] rounded-xl hover:bg-[#324aa4] group">
          <div>
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Withdrawn</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{claims}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default DashboardVestingSummary;
