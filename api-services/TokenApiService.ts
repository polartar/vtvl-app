import CoreApiService from '@api-services/CoreApiService';
import { ICreateDeployedTokenRequest, IImportTokenRequest, IToken, IUpdateTokenRequest } from 'interfaces/token';

class TokenApiService {
  // Token APIs
  createToken: (payload: ICreateDeployedTokenRequest) => Promise<IToken> = (payload) =>
    CoreApiService.post('/token', payload);

  importToken = (payload: IImportTokenRequest) => CoreApiService.post<IToken>('/token/import', payload);

  getTokens = () => CoreApiService.get<IToken[]>('/token');

  getToken = (tokenId: string) => CoreApiService.get<IToken>(`/token/${tokenId}`);

  updateToken = (tokenId: string, payload: IUpdateTokenRequest) =>
    CoreApiService.put<IToken>(`/token/${tokenId}`, payload);

  // inviteMember = (payload: IOrgMemberInviteRequest) =>
  //   CoreApiService.post(`/organization/${payload.organizationId}/invite/${PLATFORM_NAME}`, payload);
}

export default new TokenApiService();
