export interface IVestingContract {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'INITIALIZED';
  name: string;
  tokenAddress: string;
  address: string;
  deployer: string;
  organizationId: string;
  createdAt: number;
  updatedAt: number;
  chainId: number;
  transactionId: string;
  balance: string;
}

export interface IFundContractProps {
  name?: string;
  logo?: string;
  symbol: string;
  address: string;
  amount: string;
}
