import { IUser } from 'types/models';
import { IUserType } from 'types/models/member';

export interface ILocalStorage {
  safeAddress?: string;
  user?: IUser;
  roleOverride?: IUserType;
  isAuthenticated?: boolean;
}
