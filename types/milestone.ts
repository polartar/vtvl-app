import { IVestingStatus } from './models/vesting';

export enum EMilestoneFreq {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}
export enum EMilestoneType {
  SIMPLE = 'simple',
  VESTED = 'vested'
}

export interface IMilestoneError {
  title: string;
  allocation: string;
}

export interface IDuration {
  type: 'month' | 'year';
  value: number;
}
export interface IMilestoneInput {
  title: string;
  description?: string;
  allocation: string;
  duration: IDuration;
  releaseFreq: EMilestoneFreq;
}

export interface IMilestoneForm {
  organizationId: string;
  chainId: number;
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  allocation: string;
  type: EMilestoneType;
  template: string;
  milestones: IMilestoneInput[];
  archive?: boolean;
  status?: IVestingStatus;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export const ERROR_EMPTY_STATE = {
  recipientName: '',
  recipientEmail: '',
  recipientAddress: '',
  allocation: '',
  template: ''
};
