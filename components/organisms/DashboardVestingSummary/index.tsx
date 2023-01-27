import DashboardBarChart from '@components/molecules/DashboardBarChart';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { formatNumber } from 'utils/token';
import { BNToAmountString } from 'utils/web3';

const DashboardVestingSummary = () => {
  const { chainId } = useWeb3React();
  const { vestingContracts, vestings, recipients } = useDashboardContext();
  const { mintFormState } = useTokenContext();

  const [totalAllocation, setTotalAllocation] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [totalWithdrawn, setTotalWithdrawn] = useState(ethers.BigNumber.from(0));
  const [totalClaimable, setTotalClaimable] = useState(ethers.BigNumber.from(0));
  const [claims, setClaims] = useState(0);

  useEffect(() => {
    if (vestingContracts.length > 0 && chainId && mintFormState && mintFormState.address && vestings.length > 0) {
      let recipientAddresses = vestings.reduce((res, vesting) => {
        res = [...res, ...vesting.data.recipients.map((recipient) => recipient.walletAddress)];
        return res;
      }, [] as string[]);
      recipientAddresses = recipientAddresses.filter(
        (address, index) => recipientAddresses.findIndex((addr) => addr === address) === index
      );

      const multicall = new Multicall({
        ethersProvider: ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc),
        tryAggregate: true
      });
      const contractCallContext: ContractCallContext[] = vestingContracts.reduce((res, vestingContract, index) => {
        res = [
          ...res,
          ...recipientAddresses.map((recipient) => ({
            reference: `claim-${vestingContract.data.address}-${recipient}`,
            contractAddress: vestingContract.data.address,
            abi: VTVL_VESTING_ABI.abi,
            calls: [{ reference: 'getClaim', methodName: 'getClaim', methodParameters: [recipient] }]
          })),
          ...recipientAddresses.map((recipient) => ({
            reference: `claimableAmount-${vestingContract.data.address}-${recipient}`,
            contractAddress: vestingContract.data.address,
            abi: VTVL_VESTING_ABI.abi,
            calls: [{ reference: 'claimableAmount', methodName: 'claimableAmount', methodParameters: [recipient] }]
          }))
        ];
        return res;
      }, [] as ContractCallContext[]);

      multicall
        .call(contractCallContext)
        .then((res) => {
          const VEST_AMOUNT_COLUMN = 4;
          const WITHDRAWN_AMOUNT_COLUMN = 6;

          let claimedCount = 0;
          let totalAllocationAmount = ethers.BigNumber.from(0);
          let totalWithdrawnAmount = ethers.BigNumber.from(0);
          let totalClaimableAmount = ethers.BigNumber.from(0);

          Object.keys(res.results).forEach((key) => {
            if (key.includes('claimableAmount')) {
              totalClaimableAmount = totalClaimableAmount.add(res.results[key].callsReturnContext[0].returnValues[0]);
            } else {
              totalAllocationAmount = totalAllocationAmount.add(
                res.results[key].callsReturnContext[0].returnValues[VEST_AMOUNT_COLUMN]
              );
              totalWithdrawnAmount = totalWithdrawnAmount.add(
                res.results[key].callsReturnContext[0].returnValues[WITHDRAWN_AMOUNT_COLUMN]
              );

              if (
                ethers.BigNumber.from(res.results[key].callsReturnContext[0].returnValues[WITHDRAWN_AMOUNT_COLUMN]).gt(
                  ethers.BigNumber.from(0)
                )
              )
                claimedCount++;
            }
          });

          setClaims(claimedCount);
          setTotalAllocation(totalAllocationAmount);
          setTotalWithdrawn(totalWithdrawnAmount);
          setTotalClaimable(totalClaimableAmount);
        })
        .catch((err) => console.log({ err }));
    }
  }, [chainId, vestingContracts, mintFormState, vestings]);

  return (
    <div className="border-b border-info pb-8">
      <div className="px-8 py-6 flex justify-between border-t border-b border-info">
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
            {mintFormState.supplyCap === 'UNLIMITED' ? 'Unlimited' : mintFormState.maxSupply}
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
      <div className="mt-4 grid grid-cols-4 gap-6 px-8">
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
            <div className="text-[32px] font-medium text-black group-hover:text-white">{claims}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" />
        </div>
      </div>
    </div>
  );
};

export default DashboardVestingSummary;
