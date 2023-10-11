import { IUser } from 'types/models';
import { IUserType } from 'types/models/member';
import { IRole } from 'types/models/settings';

export interface ILocalStorage {
  safeAddress?: string;
  user?: IUser;
  roleOverride?: IRole;
  isAuthenticated?: boolean;
}
