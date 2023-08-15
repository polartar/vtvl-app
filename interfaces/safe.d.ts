import { IOwner } from 'types/models';

interface ISafeRequest {
  safeId?: string;
  organizationId: string;
  address: string;
  chainId: number;
  name?: string;
  requiredConfirmations: number;
  owners: ISafeOwner[] | IOwner[];
}

interface ISafeResponse {
  id: string;
  address: string;
  chainId: number;
  organizationId: string;
  name: string;
  safeOwners: ISafeOwner[];
  requiredConfirmations: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ISafeOwner {
  id: string;
  safeWalletId: string;
  address: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}
