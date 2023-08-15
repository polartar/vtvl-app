interface ITransactionRequest {
  hash: string;
  safeHash: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  to: string;
  type:
    | 'VESTING_DEPLOYMENT'
    | 'FUNDING_CONTRACT'
    | 'ADDING_CLAIMS'
    | 'TOKEN_DEPLOYMENT'
    | 'REVOKE_CLAIM'
    | 'ADMIN_WITHDRAW';
  createdAt: number;
  updatedAt: number;
  organizationId: string;
  chainId: number;
  vestingIds?: string[];
  withdrawAmount?: string;
  vestingContractId?: string;
  approvers?: string[];
}

interface ITransaction extends ITransactionRequest {
  id: string;
}