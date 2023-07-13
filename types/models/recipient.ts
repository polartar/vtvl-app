import { IVestingSchedule } from 'interfaces/vestingSchedule';
import { SupportedChainId } from 'types/constants/supported-chains';

import { IVesting } from './vesting';

enum RecipeStatus {
  ACCEPTED,
  PENDING,
  REVOKED
}
export interface IRecipient {
  id: string;
  vestingId: string;
  organizationId: string;
  name: string;
  email: string;
  company?: string;
  allocations: string;
  address: string;
  role: IRecipientTypeValue;
  chainId?: SupportedChainId;
  // status?: 'accepted' | 'delivered' | '';
  status?: RecipeStatus;
  updatedAt?: string;
  createdAt?: string;
  code?: string;
  userId?: string;
  vesting?: IVestingSchedule;
}

export interface IRecipientForm {
  walletAddress: string;
  name: string;
  email: string;
  company: string;
  recipientType: IRecipientType[];
  allocations?: number;
}

export interface IRecipientType {
  label: string;
  value: string;
}

export interface IRecipientFormState {
  recipients: IRecipientForm[];
}

// export interface IRecipientDoc {
//   id: string;
//   data: IRecipient;
// }
export interface IRecipientData extends IRecipient {
  checked?: boolean;
}
