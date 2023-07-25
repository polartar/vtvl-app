import PendingActionsFilter from '@components/molecules/PendingActionsFilter';
import { injected } from '@connectors/index';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import PendingRevokingAction from 'components/organisms/DashboardPendingActions/PendingRevokingAction';
import VestingContractPendingAction from 'components/organisms/DashboardPendingActions/VestingContractPendingAction';
import VestingSchedulePendingAction from 'components/organisms/DashboardPendingActions/VestingSchedulePendingAction';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import { useTokenContext } from 'providers/token.context';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useState } from 'react';
import { fetchVestingContractsByQuery, updateVestingContract } from 'services/db/vestingContract';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { ITransaction, IVesting } from 'types/models';
import { formatNumber, parseTokenAmount } from 'utils/token';

import PendingAdminWithdrawAction from './PendingAdminWithdrawAction';

export type IStatus =
  | 'AUTHORIZATION_REQUIRED'
  | 'PENDING_APPROVAL'
  | 'TRANSFER_OWNERSHIP'
  | 'REMOVE_ORIGINAL_OWNERSHIP'
  | 'SUCCESS'
  | 'CONTRACT_REQUIRED'
  | 'FUNDING_REQUIRED'
  | 'EXECUTABLE'
  | '';

export type ITransactionStatus =
  | 'CREATE_SIGN_TRANSACTION'
  | 'WAITING_APPROVAL'
  | 'APPROVAL_REQUIRED'
  | 'EXECUTABLE'
  | 'SUCCESS'
  | '';

export const STATUS_MAPPING: { [key in IStatus]: string } = {
  '': '',
  AUTHORIZATION_REQUIRED: 'Authorization required',
  EXECUTABLE: 'Needs execution',
  PENDING_APPROVAL: 'Waiting for approval',
  TRANSFER_OWNERSHIP: 'Transfer ownership',
  REMOVE_ORIGINAL_OWNERSHIP: 'Remove original ownership',
  SUCCESS: 'Success',
  CONTRACT_REQUIRED: 'Contract required',
  FUNDING_REQUIRED: 'Funding required'
};

export const TRANSACTION_STATUS_MAPPING: { [key in ITransactionStatus]: string } = {
  '': '',
  CREATE_SIGN_TRANSACTION: 'Create & sign',
  WAITING_APPROVAL: 'Waiting for approval',
  EXECUTABLE: 'Executable',
  APPROVAL_REQUIRED: 'Approval required',
  SUCCESS: 'SUCCESS'
};

const DashboardPendingActions = () => {
  const { chainId } = useWeb3React();
  const { organizationId } = useAuthContext();
  const { vestingContracts, vestings, revokings } = useDashboardContext();
  const { transactions } = useTransactionLoaderContext();

  const [pendingVestingContracts, setPendingVestingContracts] = useState<IVestingContract[]>([]);
  const [pendingVestings, setPendingVestings] = useState<{ id: string; data: IVesting }[]>([]);
  const [pendingWithdrawTransactions, setPendingWithdrawTransactions] = useState<{ id: string; data: ITransaction }[]>(
    []
  );
  const [filter, setFilter] = useState<{
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  }>({ keyword: '', status: 'ALL' });

  useEffect(() => {
    if (vestingContracts && vestingContracts.length > 0) {
      setPendingVestingContracts(
        vestingContracts.filter(
          (vestingContract) => vestingContract.status === 'INITIALIZED' || vestingContract.status === 'PENDING'
        )
      );
    }
  }, [vestingContracts]);

  useEffect(() => {
    if (vestings && vestings.length > 0) {
      setPendingVestings(
        vestings.filter((vesting) => vesting.data.status !== 'COMPLETED' && vesting.data.status !== 'LIVE')
      );
    }
  }, [vestings]);

  useEffect(() => {
    if (transactions && transactions.length) {
      setPendingWithdrawTransactions(
        transactions.filter(
          (transaction) => transaction.data.type === 'ADMIN_WITHDRAW' && transaction.data.status === 'PENDING'
        )
      );
    }
  }, [transactions]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Pending Actions</h1>
      <div className="mb-6">
        <PendingActionsFilter filter={filter} updateFilter={setFilter} />
      </div>
      <div className="border border-[#d0d5dd] rounded-xl w-full max-h-[700px] overflow-y-auto">
        <div className="flex bg-[#f2f4f7] text-[#475467] text-xs">
          <div className="w-16 py-3 flex-shrink-0 bg-[#f2f4f7]"></div>
          <div className="w-36 py-3 flex-shrink-0 bg-[#f2f4f7]">Name</div>
          <div className="w-52 py-3 flex-shrink-0 bg-[#f2f4f7]">Type</div>
          <div className="w-52 py-3 flex-shrink-0 bg-[#f2f4f7]">Status</div>
          <div className="w-40 py-3 flex-shrink-0 bg-[#f2f4f7]">Contract</div>
          <div className="w-32 py-3 flex-shrink-0 bg-[#f2f4f7]">Safe</div>
          <div className="w-32 py-3 flex-shrink-0 bg-[#f2f4f7]">Safe Nonce</div>
          <div className="w-40 py-3 flex-shrink-0 bg-[#f2f4f7]">Total allocation</div>
          <div className="min-w-[200px] flex-grow py-3 flex-shrink-0 bg-[#f2f4f7]"></div>
        </div>
        {pendingVestingContracts.map((vestingContract) => (
          <VestingContractPendingAction
            id={vestingContract.id}
            data={vestingContract}
            key={vestingContract.id}
            filter={filter}
            updateFilter={setFilter}
          />
        ))}
        {pendingVestings.map((vesting, index) => (
          <VestingSchedulePendingAction
            id={vesting.id}
            data={vesting.data}
            key={vesting.id}
            filter={filter}
            updateFilter={setFilter}
            isBatchTransaction={
              !!pendingVestings.find((v, i) => v.data.transactionId === vesting.data.transactionId && i < index)
            }
          />
        ))}
        {revokings.map((revoking) => (
          <PendingRevokingAction id={revoking.id} data={revoking.data} key={revoking.id} />
        ))}
        {pendingWithdrawTransactions.map((transaction) => (
          <PendingAdminWithdrawAction id={transaction.id} data={transaction.data} key={transaction.id} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPendingActions;
