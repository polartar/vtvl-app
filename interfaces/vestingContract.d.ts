import { IToken } from 'types/models';

import { VestingContractStatus } from './enums';

interface IVestingContract {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  tokenId: string;
  name: string;
  address: string | null;
  transactionId: string | null;
  balance?: string | number;
  chainId: number;
  isDeployed: boolean;
  token?: IToken;
  isActive: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'INITIALIZED';
  createdAt: string;
  updatedAt: string;
}

interface ICreateVestingContractRequest {
  organizationId: string;
  tokenId: string;
  name: string;
  chainId: number;
}

interface IDeployVestingContractRequest {
  organizationId: string;
  address?: string;
  chainId: number;
  status: VestingContractStatus;
  isDeployed: boolean;
}

interface IUpdateVestingContractRequest {
  organizationId: string;
  tokenId: string;
  name: string;
  address?: string;
  transactionId: string;
  chainId: number;
}
