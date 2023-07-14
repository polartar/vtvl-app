// import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IRecipient } from 'types/models';
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
  status?: IVestingStatus;
  recipes: IRecipient[];
  redirectUri: string;
}
