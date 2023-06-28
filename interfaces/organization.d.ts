import { IRole } from 'types/models/settings';

interface IOrganizationRequest {
  name: string;
  email: string;
}
interface IOrganizationResponse extends IOrganizationRequest {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isAccepted: boolean;
  organizationId: string;
  role: IRole;
  organization: {
    createdAt: string;
    updatedAt: string;
    userId: string;
    name: string;
    id: string;
    email: string;
  };
}

interface IOrgMemberRequest {
  organizationId: string;
  members: string[];
}

interface IOrgMemberInviteRequest {
  organizationId: string;
  name: string;
  email: string;
  role: string;
  redirectUri: string;
}
