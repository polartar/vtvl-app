import { IRole } from 'types/models/settings';

export type DateDurationOptions = 'hour' | 'day' | 'week' | 'month' | 'year';
export type DateDurationOptionsPlural = `${DateDurationOptions}s`;
export type DateDurationOptionValues = DateDurationOptions | DateDurationOptionsPlural;
export type CliffDuration = 'no-cliff' | `${number}-${DateDurationOptionValues}`;

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

export type ReleaseFrequencyType =
  | 'continuous'
  | 'minute'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | `every-${number}-${DateDurationOptionValues}`;

interface IVestingSchedule {
  id?: string;
  organizationId: string;
  tokenId: string;
  vestingContractId: string;
  name: string;
  startedAt: Date | null | undefined;
  endedAt?: Date | null | undefined;
  releaseFrequencyType: ReleaseFrequencyType;
  releaseFrequency: number;
  cliffDurationType: CliffDuration;
  cliffDuration: number;
  cliffAmount: number;
  amount: string;
}
