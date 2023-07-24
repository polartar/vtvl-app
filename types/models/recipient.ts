import { IVestingSchedule } from 'interfaces/vestingSchedule';
import { SupportedChainId } from 'types/constants/supported-chains';

import { IRole } from './settings';

export enum RecipeStatus {
  ACCEPTED,
  PENDING,
  REVOKED
}

interface IUser {
  createdAt: string;
  email: string;
  firebaseId: string;
  id: string;
  isActive: boolean;
  isAdmin: boolean;
  name: string;
  updatedAt: string;
}
export interface IRecipientInput {
  email: string;
  name: string;
  address: string; // no wallet
  allocations: string;
  role: IRole;
}
export interface IRecipient {
  id: string;
  vestingId: string;
  organizationId: string;
  name: string;
  email: string;
  allocations: string;
  address: string;
  role: IRole;
  chainId: SupportedChainId;
  // status?: 'accepted' | 'delivered' | '';
  status?: RecipeStatus;
  updatedAt: string;
  createdAt: string;
  code: string;
  userId: string;
  vesting: IVestingSchedule;
  user: IUser;
  orgName?: string;
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
