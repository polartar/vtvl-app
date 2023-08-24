import { IRole, ITeamRole } from 'types/models/settings';

export interface IMember {
  id: string;
  createdAt: string;
  updatedAt: string;
  permission: string;
  userId: string;
  organizationId: string;
  isAccepted: boolean;
  user: {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    name: string;
    role: IRole | ITeamRole;
    isActive: boolean;
    isAdmin: boolean;
  };
}
