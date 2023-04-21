import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient, { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers/lib/ethers';
import { VestingContractInfo } from 'hooks/useChainVestingContracts';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { fetchRevokingSchedules } from 'services/db/revoking';
import useSWR from 'swr';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVesting } from 'types/models';

import ScheduleTable from './ScheduleTable';

interface IVestingsProps {
  vestings: { id: string; data: IVesting }[];
  vestingSchedulesInfo: VestingContractInfo[];
  totalBalance: string;
}
enum IStatus {
  ALL = 'ALL',
  FUND = 'FUND',
  Create = 'Create',
  Execute = 'Execute',
  Revoke = 'Revoke',
  Completed = 'Completed'
}
const Vestings: React.FC<IVestingsProps> = ({ vestings, vestingSchedulesInfo, totalBalance }) => {
  const [filter, setFilter] = useState<{
    keyword: string;
    status: IStatus;
  }>({ keyword: '', status: IStatus.ALL });
  const { chainId, library } = useWeb3React();
  const { transactions } = useTransactionLoaderContext();
  const { currentSafe, organizationId } = useAuthContext();
  const { data: revokedSchedules } = useSWR('fetchRevokings', () => fetchRevokingSchedules(organizationId || ''));

  const fetchSafeTransactionFromHash = async (txHash: string) => {
    if (currentSafe?.address && chainId) {
      const ethAdapter = new EthersAdapter({
        ethers: ethers,
        signer: library?.getSigner(0)
      });

      const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
      const safeService = new SafeServiceClient({
        txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
        ethAdapter
      });
      const apiTx: SafeMultisigTransactionResponse = await safeService.getTransaction(txHash);
      const safeTx = await safeSdk.createTransaction({
        safeTransactionData: { ...apiTx, data: apiTx.data || '0x', gasPrice: parseInt(apiTx.gasPrice) }
      });
      apiTx.confirmations?.forEach((confirmation) => {
        safeTx.addSignature(new EthSignSignature(confirmation.owner, confirmation.signature));
      });
      return safeTx;
    }
  };

  const { data: filteredVestingSchedules } = useSWR(['filteredVestingSchedule', filter.status], async () => {
    const asyncFilter = async (arr: any[], predicate: any) => {
      const results = await Promise.all(arr.map(predicate));

      return arr.filter((_v, index) => results[index]);
    };

    return vestings && vestings.length > 0
      ? await asyncFilter(vestings, async (vesting: any) => {
          const transaction = transactions.find(
            (t) => t.id === vesting.data.transactionId && t.data.status === 'PENDING'
          );
          let isFund;
          let safeTx;

          if (transaction && transaction.data.safeHash && currentSafe) {
            safeTx = await fetchSafeTransactionFromHash(transaction.data.safeHash);
            isFund = transaction.data.type === 'FUNDING_CONTRACT' && vesting.data.status === 'WAITING_APPROVAL';
          } else {
            isFund =
              vestingSchedulesInfo.length &&
              BigNumber.from(totalBalance).gte(BigNumber.from(vestingSchedulesInfo[0].numTokensReservedForVesting)) &&
              BigNumber.from(totalBalance)
                .sub(BigNumber.from(vestingSchedulesInfo[0].numTokensReservedForVesting))
                .lt(ethers.utils.parseEther(vesting.data.details.amountToBeVested.toString())) &&
              vesting.data.status !== 'LIVE';
          }

          if (filter.keyword && !vesting.data.name?.toLowerCase().includes(filter.keyword.toLowerCase())) {
            return false;
          }
          if (filter.status === IStatus.ALL) {
            return true;
          }
          if (filter.status === IStatus.FUND) {
            return isFund;
          }
          if (filter.status === IStatus.Completed) {
            return vesting.data.status === 'LIVE';
          }
          if (filter.status === IStatus.Create) {
            return (
              (vesting.data.status === 'INITIALIZED' && !isFund) ||
              (vesting.data.status === 'WAITING_APPROVAL' && !vesting.data.transactionId)
            );
          }
          if (filter.status === IStatus.Revoke) {
            return (
              vesting.data.status === 'REVOKED' ||
              (vesting.data.status === 'WAITING_APPROVAL' &&
                revokedSchedules?.find((schedule) => schedule.vestingId === vesting.id))
            );
          }
          if (filter.status === IStatus.Execute) {
            if (safeTx && currentSafe?.threshold && safeTx.signatures.size >= currentSafe?.threshold && !isFund) {
              return true;
            }

            return false;
          }
        })
      : [];
  }); //, [vestings, filter, transactions, revokedSchedules]);

  const filteredVestingCounts = useMemo(() => {
    let executeCount = 0;
    let fundCount = 0,
      createCount = 0,
      revokeCount = 0,
      completedCount = 0;
    vestings.forEach(async (vesting) => {
      const transaction = transactions.find((t) => t.id === vesting.data.transactionId && t.data.status === 'PENDING');
      let isFund;
      let safeTx;

      if (transaction && transaction.data.safeHash && currentSafe) {
        safeTx = await fetchSafeTransactionFromHash(transaction.data.safeHash);
        isFund = transaction.data.type === 'FUNDING_CONTRACT' && vesting.data.status === 'WAITING_APPROVAL';
      } else {
        isFund =
          vestingSchedulesInfo.length &&
          BigNumber.from(totalBalance).gte(BigNumber.from(vestingSchedulesInfo[0].numTokensReservedForVesting)) &&
          BigNumber.from(totalBalance)
            .sub(BigNumber.from(vestingSchedulesInfo[0].numTokensReservedForVesting))
            .lt(ethers.utils.parseEther(vesting.data.details.amountToBeVested.toString())) &&
          vesting.data.status !== 'LIVE';
      }

      if (safeTx && currentSafe?.threshold && safeTx.signatures.size >= currentSafe?.threshold && !isFund) {
        executeCount++;
      }

      if (isFund) {
        fundCount++;
      }
      if (
        (vesting.data.status === 'INITIALIZED' && !isFund) ||
        (vesting.data.status === 'WAITING_APPROVAL' && !vesting.data.transactionId)
      ) {
        createCount++;
      }
      if (
        vesting.data.status === 'REVOKED' ||
        (vesting.data.status === 'WAITING_APPROVAL' &&
          revokedSchedules?.find((schedule) => schedule.vestingId === vesting.id))
      ) {
        revokeCount++;
      }
      if (vesting.data.status === 'LIVE') {
        completedCount++;
      }
    });
    return [vestings.length, fundCount, createCount, executeCount, revokeCount, completedCount];
  }, [vestings, transactions, revokedSchedules, fetchSafeTransactionFromHash]);

  return (
    <div className="w-full">
      <div className="w-full flex items-center gap-4">
        <div className="flex-grow flex items-center gap-2 px-5 py-2 bg-white border border-gray-100 rounded-lg">
          <div className="w-5 h-5 relative">
            <Image src="/icons/search.svg" layout="fill" />
          </div>
          <input
            className="w-full outline-none bg-transparent"
            placeholder="Search"
            value={filter.keyword}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-5 w-full">
        <div className="inline-flex border border-[hsl(217,16%,84%)] rounded-lg overflow-hidden">
          {Object.values(IStatus).map((status, index) => {
            return (
              <div
                key={status}
                className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
                  filter.status === status ? 'bg-[#eaeaea]' : ''
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    status: status
                  });
                }}>
                {status}
                {status !== IStatus.ALL && (
                  <div
                    className={`avatar  bg-primary-50 text-primary-500 ml-3
                 w-5 h-5`}>
                    {filteredVestingCounts[index]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-[#d0d5dd] rounded-xl w-full overflow-hidden mt-3">
        <div className="flex bg-[#f2f4f7] text-[#475467] text-xs">
          <div className="w-16 py-3"></div>
          <div className="w-36 py-3">Schedule</div>
          <div className="w-52 py-3">Pending Actions</div>
          <div className="w-52 py-3">Cliff release</div>
          <div className="w-40 py-3">Vesting period</div>
          <div className="w-32 py-3"></div>
          <div className="w-40 py-3">Total allocation</div>
          <div className="min-w-[200px] flex-grow py-3"></div>
        </div>

        {filteredVestingSchedules?.map((vesting) => (
          <ScheduleTable
            id={vesting.id}
            data={vesting.data}
            key={vesting.id}
            vestingSchedulesInfo={vestingSchedulesInfo}
          />
        ))}
      </div>
    </div>
  );
};

export default Vestings;
