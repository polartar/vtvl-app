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
  const { vestingContracts, vestings } = useDashboardContext();
  const { mintFormState } = useTokenContext();

  const [totalAllocation, setTotalAllocation] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [totalWithdrawn, setTotalWithdrawn] = useState(ethers.BigNumber.from(0));
  const [totalClaimable, setTotalClaimable] = useState(ethers.BigNumber.from(0));

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
            }
          });

          setTotalAllocation(totalAllocationAmount);
          setTotalWithdrawn(totalWithdrawnAmount);
          setTotalClaimable(totalClaimableAmount);
        })
        .catch((err) => console.log({ err }));
    }
  }, [chainId, vestingContracts, mintFormState, vestings]);

  return (
    <div>
      <div className="px-8 py-6 flex justify-between border-t border-b border-info">
        <div>
          <div className="text-label text-sm font-medium">Total allocation</div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalAllocation)))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium">Withdrawn</div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalWithdrawn)))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium">Unclaimed</div>
          <div className="mt-1.5 text-info text-base font-medium text-right">
            {formatNumber(parseFloat(BNToAmountString(totalClaimable)))}
          </div>
        </div>
        <div>
          <div className="text-label text-sm font-medium">Total locked</div>
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
    </div>
  );
};

export default DashboardVestingSummary;
