export interface IVestingContract {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  address: string;
  deployer: string;
  organizationId: string;
  createdAt: number;
  updatedAt: number;
}
