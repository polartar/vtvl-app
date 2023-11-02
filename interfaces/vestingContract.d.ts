import { IToken } from 'types/models';

interface IVestingContract {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  tokenId: string;
  name: string;
  address: string | null;
  transaction: string | null;
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
  address: string;
  chainId: number;
}
