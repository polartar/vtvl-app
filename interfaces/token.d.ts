interface IToken {
  name: string;
  symbol: string;
  description?: string;
  maxSupply?: string;
  chainId?: number;
  address?: string;
  logo?: string;
  transactionId?: string;
  Transaction?: Transaction;
  isDeployed: boolean;
  isActive: boolean;
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
  isDeployed: boolean;
}
