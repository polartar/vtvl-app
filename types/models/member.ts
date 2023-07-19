import { User as FirebaseUser } from 'firebase/auth';

import { ITeamRole } from './settings';

export interface IAddress {
  walletAddress: string;
  chainId: number;
}

export interface IInvitee {
  id?: string;
  org_id: string;
  name: string;
  email: string;
  createdAt?: number;
  updatedAt?: number;
  type: ITeamRole;
}

export type IUserType =
  | 'admin'
  | 'founder'
  | 'investor'
  | 'manager'
  | 'operator'
  | 'employee'
  | 'advisor'
  | 'anonymous'
  | '';

export interface IMember {
  id?: string;
  user_id?: string;
  org_id?: string;
  name?: string;
  email?: string;
  companyEmail?: string;
  wallets?: IAddress[];
  type?: IUserType;
  joined?: number;
  createdAt?: number;
  updatedAt?: number;
  source?: '' | 'recipient';
}

export interface IUser extends FirebaseUser {
  memberInfo?: IMember;
}
