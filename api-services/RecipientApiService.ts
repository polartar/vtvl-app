import { IRecipient } from 'types/models';

import CoreApiService from './CoreApiService';

class RecipientApiService {
  // Organization APIs
  getRecipient = (id: string) => CoreApiService.get<IRecipient[]>(`/recipe/get/:${id}`);
  getRecipients = (query: string) => CoreApiService.get<IRecipient[]>(`/recipe/list?${query}`);
  updateRecipient = (id: string, body: any) => CoreApiService.put<IRecipient>(`/recipe/${id}`, body);
  getRecipientByCode = (code: string) => CoreApiService.get<IRecipient>(`/recipe/code/${code}`);
  acceptInvitation = (body: { code: string; wallet: { address: string; signature: string; utcTime: string } }) =>
    CoreApiService.post<AuthResponse>('/auth/accept-invitation', body);
  sendInvitation = (id: string, redirectUri: string, organizationId: string) =>
    CoreApiService.put(`/recipe/resend/${id}`, { redirectUri: redirectUri, organizationId });
}

export default new RecipientApiService();
