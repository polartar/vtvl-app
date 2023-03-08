import Decimal from 'decimal.js';

import { CliffDuration, ReleaseFrequency } from './constants/schedule-configuration';
import { IVesting } from './models';

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

export interface IScheduleMode {
  id?: string;
  data?: IVesting;
  edit?: boolean;
  delete?: boolean;
}
