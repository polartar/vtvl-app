export interface IOwner {
  name: string;
  walletAddress: string;
  chainId?: number;
  email?: string;
}

export interface ISafe {
  user_id?: string;
  address: string;
  chainId: number;
  owners: string[];
  threshold: number;
}
