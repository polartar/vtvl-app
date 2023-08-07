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
}

interface IImportTokenRequest {
  organizationId: string;
  chainId: number;
  logo?: string;
  address: string;
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
