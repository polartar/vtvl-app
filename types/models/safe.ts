export interface IOwner {
  name: string;
  address: string;
  chainId?: number;
  email?: string;
}

export interface ISafe {
  id?: string;
  user_id?: string;
  org_name: string;
  org_id: string;
  address: string;
  chainId: number;
  owners: IOwner[];
  threshold: number;
}
