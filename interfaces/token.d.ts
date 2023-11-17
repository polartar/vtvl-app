import { IOrganizationResponse } from './organization';

interface IToken {
  id?: string;
  name: string;
  symbol: string;
  description?: string;
  supplyCap?: 'LIMITED' | 'UNLIMITED';
  totalSupply?: string;
  maxSupply?: string;
  chainId?: number;
  address?: string;
  logo?: string;
  transactionId?: string;
  decimal?: number;
  burnable?: boolean;
  isDeployed?: boolean;
  isActive?: boolean;
  isImported?: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  organizationId?: string;
  organizations?: {
    id: string;
    organizationId: string;
    tokenId: string;
  }[];
}

interface IImportTokenRequest {
  organizationId: string;
  chainId: number;
  logo?: string;
  address: string;
  burnable: false;
}

interface ICreateDeployedTokenRequest extends IImportTokenRequest {
  name: string;
  symbol: string;
  decimal: number;
  description: string;
  totalSupply: string;
  maxSupply: string;
  supplyCap: 'LIMITED' | 'UNLIMITED';
  burnable: boolean;
  imported: boolean;
}

interface IUpdateTokenRequest {
  organizationId: string;
  totalSupply: string;
}

type ITokensResponse = {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    tokens: {
      token: IToken;
    }[];
  };
}[];
