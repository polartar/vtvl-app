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
import { IVesting, IVestingContract } from 'types/models';
import { formatNumber, parseTokenAmount } from 'utils/token';

export type IStatus =
  | 'AUTHORIZATION_REQUIRED'
  | 'PENDING_APPROVAL'
  | 'TRANSFER_OWNERSHIP'
  | 'REMOVE_ORIGINAL_OWNERSHIP'
  | 'SUCCESS'
  | 'CONTRACT_REQUIRED'
  | 'FUNDING_REQUIRED'
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

  const [pendingVestingContracts, setPendingVestingContracts] = useState<{ id: string; data: IVestingContract }[]>([]);
  const [pendingVestings, setPendingVestings] = useState<{ id: string; data: IVesting }[]>([]);

  useEffect(() => {
    if (vestingContracts && vestingContracts.length > 0) {
      setPendingVestingContracts(
        vestingContracts.filter(
          (vestingContract: { id: string; data: IVestingContract }) =>
            vestingContract.data.status === 'INITIALIZED' || vestingContract.data.status === 'PENDING'
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

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Pending Actions</h1>
      <div className="border border-[#d0d5dd] rounded-xl w-full overflow-hidden">
        <div className="flex bg-[#f2f4f7] text-[#475467] text-xs">
          <div className="w-16 py-3"></div>
          <div className="w-36 py-3">Name</div>
          <div className="w-52 py-3">Type</div>
          <div className="w-52 py-3">Status</div>
          <div className="w-40 py-3">Contract</div>
          <div className="w-32 py-3">Safe</div>
          <div className="w-40 py-3">Total allocations</div>
          <div className="min-w-[200px] flex-grow py-3"></div>
        </div>
        {pendingVestingContracts.map((vestingContract) => (
          <VestingContractPendingAction id={vestingContract.id} data={vestingContract.data} key={vestingContract.id} />
        ))}
        {vestings
          .filter((vesting) => vesting.data.status !== 'COMPLETED' && vesting.data.status !== 'LIVE')
          .map((vesting) => (
            <VestingSchedulePendingAction id={vesting.id} data={vesting.data} key={vesting.id} />
          ))}
        {revokings.map((revoking) => (
          <PendingRevokingAction id={revoking.id} data={revoking.data} key={revoking.id} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPendingActions;
