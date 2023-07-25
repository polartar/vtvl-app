import { User as FirebaseUser } from 'firebase/auth';

import { IRole, ITeamRole } from './settings';

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
  | 'manager2'
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
  role?: IRole;
  joined?: number;
  createdAt?: number;
  updatedAt?: number;
  source?: '' | 'recipient';
}

export interface IUser extends FirebaseUser {
  memberInfo?: IMember;
}
