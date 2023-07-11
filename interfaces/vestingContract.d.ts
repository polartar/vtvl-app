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
}

interface ICreateVestingContractRequest {
  organizationId: string;
  tokenId: string;
  name: string;
  chainId: number;
}
