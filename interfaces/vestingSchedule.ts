// import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IRecipientInput } from 'types/models/recipient';
import { IVestingStatus } from 'types/models/vesting';

// interface IRecipient {
//   name: string;
//   email: string;
//   address: string;
//   allocations: string;
//   role: IRole;
// }

export enum EReleaseFrequencyTypes {
  CONTINUOUS = 'CONTINUOUS',
  MINUTE = 'MINUTE',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

export enum ECliffTypes {
  NO_CLIFF = 'NO_CLIFF',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
  YEARS = 'YEARS'
}

export interface IVestingSchedule {
  id?: string;
  organizationId: string;
  tokenId: string;
  vestingContractId: string;
  name: string;
  startedAt?: string;
  endedAt?: string;
  originalEndedAt?: string;
  // releaseFrequencyType: EReleaseFrequencyTypes;
  releaseFrequencyType: ReleaseFrequency;
  releaseFrequency: number;
  cliffDurationType: CliffDuration;
  // cliffDurationType: ECliffTypes;
  cliffDuration: number;
  cliffAmount: string;
  amount: string;
  transactionId?: string;
  status?: IVestingStatus;
  recipes: IRecipientInput[];
  redirectUri: string;
  vestingContract?: IVestingScheduleContract;
  token?: IVestingScheduleToken;
  createdAt?: string;
  updatedAt?: string;
  archive: boolean;
  createdBy?: string;
}

export interface IVestingScheduleContract {
  id: string;
  firebaseId?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  tokenId: string;
  name: string;
  address?: string;
  chainId: number;
  transactionId?: string;
  isDeployed: boolean;
  isActive: boolean;
  status: string;
}

export interface IVestingScheduleToken {
  id: string;
  firebaseId?: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  symbol: string;
  decimal: number;
  imported: boolean;
  burnable: boolean;
  description: string;
  maxSupply: string;
  supplyCap: string;
  chainId: number;
  address?: string;
  logo: string;
  transactionId?: string;
  isDeployed: boolean;
  isActive: boolean;
}
