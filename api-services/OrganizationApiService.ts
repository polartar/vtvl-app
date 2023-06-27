import CoreApiService from '@api-services/CoreApiService';
import { PLATFORM_NAME } from '@utils/constants';

class OrganizationApiService {
  // Organization APIs
  getOrganizations = () => CoreApiService.get<IOrganizationResponse[]>(`/organization/${PLATFORM_NAME}`);
  createOrganization = (payload: IOrganizationRequest) =>
    CoreApiService.post<IOrganizationResponse>('/organization', payload);

  // Organization Member APIs
  getMembers = (orgId: string) => CoreApiService.get(`/organization/${orgId}/members`);

  createMember = (payload: IOrgMemberRequest) =>
    CoreApiService.post(`/organization/${payload.organizationId}/members/${PLATFORM_NAME}`, payload);

  inviteMember = (payload: IOrgMemberInviteRequest) =>
    CoreApiService.post(`/organization/${payload.organizationId}/invite/${PLATFORM_NAME}`, payload);
}

export default new OrganizationApiService();
