import CoreApiService from '@api-services/CoreApiService';

class OrganizationApiService {
  getOrganizations = () => CoreApiService.get<IOrganizationResponse>('/organization');
}

export default new OrganizationApiService();
