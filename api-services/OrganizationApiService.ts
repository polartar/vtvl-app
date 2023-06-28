import MainApiService from '@api-services/MainApiService';
import { PLATFORM_NAME } from '@utils/constants';
import {
  IOrgMemberInviteRequest,
  IOrgMemberRequest,
  IOrganizationRequest,
  IOrganizationResponse
} from 'interfaces/organization';

class OrganizationApiService {
  // Organization APIs
  getOrganizations = () => MainApiService.get<IOrganizationResponse[]>(`/organization/${PLATFORM_NAME}`);
  createOrganization = (payload: IOrganizationRequest) =>
    MainApiService.post<IOrganizationResponse>('/organization', payload);

  // Organization Member APIs
  getMembers = (orgId: string) => MainApiService.get(`/organization/${orgId}/members`);

  createMember = (payload: IOrgMemberRequest) =>
    MainApiService.post(`/organization/${payload.organizationId}/members/${PLATFORM_NAME}`, payload);

  inviteMember = (payload: IOrgMemberInviteRequest) =>
    MainApiService.post(`/organization/${payload.organizationId}/invite/${PLATFORM_NAME}`, payload);
}

export default new OrganizationApiService();
