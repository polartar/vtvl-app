import CoreApiService from '@api-services/CoreApiService';

class TokenApiService {
  // Token APIs
  createToken = (payload: ICreateDeployedTokenRequest) => CoreApiService.post('/token', payload);

  importToken = (payload: IImportTokenRequest) => CoreApiService.post('/token/import', payload);

  getTokens = () => CoreApiService.get<IToken[]>('/token');

  // inviteMember = (payload: IOrgMemberInviteRequest) =>
  //   CoreApiService.post(`/organization/${payload.organizationId}/invite/${PLATFORM_NAME}`, payload);
}

export default new TokenApiService();
