import { IScheduleFormState } from '@providers/vesting.context';
import { MultiValue } from 'react-select';
import { IRecipient } from 'types/vesting';

export interface IVesting {
  details: IScheduleFormState;
  recipients: MultiValue<IRecipient>;
  owner: string;
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
