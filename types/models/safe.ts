export interface Owner {
  name: string;
  walletAddress: string;
  chainId?: number;
  email?: string;
}

export interface Safe {
  userId?: string;
  address: string;
  chainId: number;
  owners: string[];
  threshold: number;
}
