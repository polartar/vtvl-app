export interface IAddress {
  walletAddress: string;
  chainId: number;
}

export interface IMember {
  user_id?: string;
  org_id: string;
  name: string;
  email: string;
  wallets?: [IAddress];
  type: string;
}

export interface IUser {
  id: string;
}
