interface IRevokingRequest {
  vestingId: string;
  recipeId: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  chainId: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

interface IRevoking extends IRevokingRequest {
  id: string;
}
