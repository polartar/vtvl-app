import Decimal from 'decimal.js';

export interface IToken {
  name: string;
  symbol: string;
  address: string;
  logo: string;
  organizationId: string;
  imported?: boolean;
  createdAt?: number;
  updatedAt?: number;
  supplyCap?: string;
  maxSupply?: number;
  initialSupply?: number;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  decimals?: number;
  chainId: number;
}

export interface TUserTokenDetails {
  name: string;
  symbol: string;
  totalAllocation: Decimal;
  cliffAmount: Decimal;
  releaseAmount: Decimal;
  claimableAmount: Decimal;
  claimedAmount: Decimal;
  remainingAmount: Decimal;
  vestedAmount: Decimal;
  vestingProgress: number;
  cliffDate: string | Date;
  numberOfReleases: number;
  vestingContractAddress: string;
}
