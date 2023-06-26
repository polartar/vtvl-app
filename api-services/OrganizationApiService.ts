import CoreApiService from '@api-services/CoreApiService';

class OrganizationApiService {
  // Organization APIs
  getOrganizations = () => CoreApiService.get<IOrganizationResponse[]>('/organization');
  createOrganization = (payload: IOrganizationRequest) =>
    CoreApiService.post<IOrganizationResponse>('/organization', payload);

  // Organization Member APIs
  getMembers = (orgId: string) => CoreApiService.get(`/organization/${orgId}/members`);
  createMember = (payload: IOrgMemberRequest) =>
    CoreApiService.post(`/organization/${payload.organizationId}/members`, payload);
  inviteMember = (payload: IOrgMemberInviteRequest) =>
    CoreApiService.post(`/organization/${payload.organizationId}/invite`, payload);
}

export default new OrganizationApiService();
