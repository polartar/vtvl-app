import CoreApiService from '@api-services/CoreApiService';
import { ICreateDeployedTokenRequest, IImportTokenRequest } from 'interfaces/token';

class TokenApiService {
  // Token APIs
  createToken = (payload: ICreateDeployedTokenRequest) => CoreApiService.post('/token', payload);

  importToken = (payload: IImportTokenRequest) => CoreApiService.post('/token/import', payload);

  // inviteMember = (payload: IOrgMemberInviteRequest) =>
  //   CoreApiService.post(`/organization/${payload.organizationId}/invite/${PLATFORM_NAME}`, payload);
}

export default new TokenApiService();
