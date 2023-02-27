import { IScheduleFormState } from '@providers/vesting.context';
import Decimal from 'decimal.js';
import { MultiValue } from 'react-select';

import { IRecipientForm } from './recipient';

export type IVestingStatus =
  | 'INITIALIZED'
  | 'WAITING_APPROVAL'
  | 'WAITING_FUNDS'
  | 'LIVE'
  | 'CREATING'
  | 'CREATED'
  | 'COMPLETED'
  | 'REVOKED'
  | 'APPROVED'
  | 'SUCCESS'
  | 'FAILED';

export interface IVesting {
  name?: string;
  details: IScheduleFormState;
  recipients: MultiValue<IRecipientForm>;
  status?: IVestingStatus;
  organizationId: string;
  tokenAddress?: string;
  tokenId?: string;
  vestingContractId?: string;
  createdAt?: number;
  updatedAt?: number;
  transactionId: string;
  archive?: boolean;
  chainId: number;
}

export interface IScheduleOverviewProps {
  name: string;
  beneficiaries: number;
  startDate: string;
  endDate: string;
  cliff: string;
  linearRelease: string;
  totalAllocated: string;
}

export interface IScheduleSummaryProps {
  name: string;
  tokenPerUser: number | string;
  beneficiaries: number;
  totalPeriod: string;
  createdBy: string;
}

export interface IVestingContractProps {
  tokenName: string;
  tokenSymbol: string;
  supplyCap: 'LIMITED' | 'UNLIMITED';
  maxSupply: number | Decimal;
  address: string;
}
