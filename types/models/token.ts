import Decimal from 'decimal.js';
import { ethers } from 'ethers';

type TokenNumber = number | Decimal | ethers.BigNumber;

export interface IToken {
  name?: string;
  symbol?: string;
  address?: string;
  logo?: string;
  organizationId?: string;
  imported?: boolean;
  burnable?: boolean;
  burntAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  supplyCap?: string;
  maxSupply?: number;
  totalSupply?: number;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  decimals?: number;
  chainId?: number;
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
  lockedTokens: Decimal;
}

export interface TCapTableRecipientTokenDetails {
  scheduleId: string;
  name: string;
  // company: string;
  recipientType: string;
  address: string;
  totalAllocation: TokenNumber;
  claimed: TokenNumber;
  unclaimed: TokenNumber;
  lockedTokens: TokenNumber;
}
