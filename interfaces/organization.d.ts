interface IOrganizationRequest {
  name: string;
  email: string;
}
interface IOrganizationResponse extends IOrganizationRequest {
  id: string;
  userId: string;
}

interface IOrgMemberRequest {
  organizationId: string;
  members: string[];
}
