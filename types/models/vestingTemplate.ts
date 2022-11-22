import { IScheduleFormState } from '@providers/vesting.context';

export interface IVestingTemplate {
  name: string;
  label: string;
  value: string;
  details: IScheduleFormState;
  tokenId?: string;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
  organizationId: string;
}
