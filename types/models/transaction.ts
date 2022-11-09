export interface ITransaction {
  hash: string;
  safeHash: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  to: string;
  type: 'VESTING_DEPLOYMENT' | 'FUNDING_VESTING' | 'ADDING_CLAIMS' | 'TOKEN_DEPLOYMENT';
  createdAt: number;
  updatedAt: number;
  organizationId: string;
}