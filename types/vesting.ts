import Decimal from 'decimal.js';
import { MultiValue } from 'react-select';

import { CliffDuration, ReleaseFrequency } from './constants/schedule-configuration';

export interface IRecipient {
  walletAddress: string;
  name: string;
  company: string;
  recipientType: MultiValue<IRecipientType>;
  allocations?: number;
}

export interface IRecipientType {
  label: string | number;
  value: string | number;
}

export interface IRecipientFormState {
  recipients: MultiValue<IRecipient>;
}

export interface IChartDataTypes {
  start: Date;
  end: Date;
  cliffDuration: CliffDuration;
  cliffAmount: number | Decimal;
  frequency: ReleaseFrequency;
  vestedAmount: number | Decimal;
}

export interface IScheduleState {
  name: string;
  contractName?: string;
  createNewContract: boolean;
  vestingContractId?: string;
}
