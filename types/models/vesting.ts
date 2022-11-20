import { IScheduleFormState } from '@providers/vesting.context';
import Decimal from 'decimal.js';
import { MultiValue } from 'react-select';
import { IRecipient } from 'types/vesting';

export interface IVesting {
  details: IScheduleFormState;
  recipients: MultiValue<IRecipient>;
  status?:
    | 'INITIALIZED'
    | 'WAITING_APPROVAL'
    | 'WAITING_FUNDS'
    | 'LIVE'
    | 'CREATING'
    | 'CREATED'
    | 'COMPLETED'
    | 'APPROVED'
    | 'SUCCESS'
    | 'FAILED';
  organizationId: string;
  vestingContract?: string;
  createdAt?: number;
  updatedAt?: number;
  transactionId: string;
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
