export interface Address {
  walletAddress: string;
  chainId: number;
}

export interface Member {
  userId?: string;
  orgId: string;
  name: string;
  email: string;
  wallet?: [Address];
  type: string;
}

export interface User {
  id: string;
}
