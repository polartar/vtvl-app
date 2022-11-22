export interface IVestingContract {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  tokenAddress: string;
  address: string;
  deployer: string;
  organizationId: string;
  createdAt: number;
  updatedAt: number;
}

export interface IFundContractProps {
  name?: string;
  logo?: string;
  symbol: string;
  address: string;
  amount: string;
}
