export interface IOwner {
  name: string;
  address: string;
  chainId?: number;
  email?: string;
}

export interface ISafe {
  user_id?: string;
  address: string;
  chainId: number;
  owners: IOwner[];
  threshold: number;
}
