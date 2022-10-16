export interface IAddress {
  walletAddress: string;
  chainId: number;
}

export interface IMember {
  userId?: string;
  orgId: string;
  name: string;
  email: string;
  wallets?: [IAddress];
  type: string;
}

export interface IUser {
  id: string;
}
