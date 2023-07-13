interface IVestingContract {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  tokenId: string;
  name: string;
  address: string | null;
  transaction: string | null;
  chainId: number;
  isDeployed: boolean;
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
