import { User as FirebaseUser } from 'firebase/auth';

export interface IAddress {
  walletAddress: string;
  chainId: number;
}

export interface IInvitee {
  org_id: string;
  name: string;
  email: string;
}

export interface IMember {
  id?: string;
  user_id?: string;
  org_id?: string;
  name?: string;
  email?: string;
  companyEmail?: string;
  wallets?: [IAddress];
  type?: string;
  joined?: number;
}

export interface IUser extends FirebaseUser {
  memberInfo?: IMember;
}
