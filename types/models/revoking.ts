export interface IRevoking {
  vestingId: string;
  recipient: string;
  transactionId: string;
  createdAt: number;
  updatedAt: number;
  organizationId: string;
  chainId: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}
export interface IRevokingDoc {
  id: string;
  data: IRevoking;
}
