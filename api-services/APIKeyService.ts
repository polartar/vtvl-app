import { IAPIKey, IAPIKeyCreate } from 'interfaces/apiKey';

import CoreApiService from './CoreApiService';

class APIKeyService {
  createAPIKey = (payload: IAPIKeyCreate) => CoreApiService.post<IAPIKey>('/membership', payload);
  getAPIKeys = (organizationId?: string) =>
    CoreApiService.get<IAPIKey[]>(`/membership/organizationId/${organizationId}`);
  deleteAPIKey = (organizationId: string, id: string) => CoreApiService.delete(`/membership/${organizationId}/${id}`);
}

export default new APIKeyService();
