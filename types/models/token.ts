export interface IToken {
  name: string;
  symbol: string;
  address: string;
  logo: string;
  organizationId: string;
  imported: boolean;
  createdAt: number;
  updatedAt: number;
  supplyCap: string;
  maxSupply?: number;
  initialSupply?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}
