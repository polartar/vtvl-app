import DashboardBarChart from '@components/molecules/DashboardBarChart';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import getUnixTime from 'date-fns/getUnixTime';
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

      // Setup multicall
      const contractCallContext: ContractCallContext[] = vestingContracts.reduce((res, vestingContract, index) => {
        res = [
          ...res,
          ...recipientAddresses.map((recipient) => ({
            reference: `multicall-${vestingContract.data.address}-${recipient}`,
            contractAddress: vestingContract.data.address,
            abi: VTVL_VESTING_ABI.abi,
            calls: [
              { reference: 'claimableAmount', methodName: 'claimableAmount', methodParameters: [recipient] },
              { reference: 'finalVestedAmount', methodName: 'finalVestedAmount', methodParameters: [recipient] },
              {
                reference: 'vestedAmount',
                methodName: 'vestedAmount',
                methodParameters: [recipient, getUnixTime(new Date())]
              }
            ]
          }))
        ];
        return res;
      }, [] as ContractCallContext[]);

      // Call the multicall feature
      multicall
        .call(contractCallContext)
        .then((res) => {
          console.log('MULTICALL', res);
          // Set constants for referencing the calls based on the multicall setup above
          const CLAIMABLE_AMOUNT_CALL = 0;
          const FINAL_VESTED_AMOUNT_CALL = 1;
          const VESTED_AMOUNT_CALL = 2;

          // Set the default values for the totals
          let claimedCount = 0;
          let totalAllocationAmount = ethers.BigNumber.from(0);
          let totalWithdrawnAmount = ethers.BigNumber.from(0);
          let totalClaimableAmount = ethers.BigNumber.from(0);

          Object.keys(res.results).forEach((key, index) => {
            const record = res.results[key].callsReturnContext;
            // Gets the claimable amount of the recipient
            const claimableAmount = record[CLAIMABLE_AMOUNT_CALL].returnValues[0];
            // Gets the total allocation of the recipient
            const finalVestedAmount = record[FINAL_VESTED_AMOUNT_CALL].returnValues[0];
            // Gets the vested amount of the recipient -- which is the claimed and unclaimed tokens
            const vestedAmount = record[VESTED_AMOUNT_CALL].returnValues[0];
            // Computes the actual withdrawn amount by getting the claimed tokens
            // unclaimed = claimableAmount
            // claimed = vested amount - unclaimed
            const claimedAmount = ethers.BigNumber.from(vestedAmount).gt(claimableAmount)
              ? ethers.BigNumber.from(vestedAmount).sub(claimableAmount)
              : ethers.BigNumber.from(0);

            console.group('RESULT LOOP', index, key);

            console.log('Claimable amount', claimableAmount);
            console.log('Total allocation', finalVestedAmount);
            console.log('Withdrawn', claimedAmount);

            console.groupEnd();

            totalClaimableAmount = totalClaimableAmount.add(claimableAmount);
            totalAllocationAmount = totalAllocationAmount.add(finalVestedAmount);
            totalWithdrawnAmount = totalWithdrawnAmount.add(claimedAmount);
            if (claimedAmount.gt(ethers.BigNumber.from(0))) claimedCount++;
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
            {mintFormState.supplyCap === 'UNLIMITED' ? 'Unlimited' : formatNumber(+mintFormState.maxSupply)}
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
            <div className="text-[#667085] text-xs leading-[1.6] font-medium group-hover:text-white">Withdrawn</div>
            <div className="text-[32px] font-medium text-black group-hover:text-white">{claims}</div>
          </div>
          <img src="/icons/caret-right-border.svg" alt="VTVL" />
        </div>
      </div>
    </div>
  );
};

export default DashboardVestingSummary;
