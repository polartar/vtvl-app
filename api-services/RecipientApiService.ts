import CoreApiService from '@api-services/CoreApiServiceTemp';
import { IRecipient } from 'types/models';

class RecipientApiService {
  // Organization APIs
  getRecipient = (id: string) => CoreApiService.get<IRecipient[]>(`/recipe/get/:${id}`);
  getRecipients = (query: string) => CoreApiService.get<IRecipient[]>(`/recipe/list?${query}`);
  updateRecipient = (id: string, body: any) => CoreApiService.patch<IRecipient>(`/recipe/${id}`, body);
  getRecipientByCode = (code: string) => CoreApiService.get<IRecipient>(`/recipe/code/${code}`);
  acceptInvitation = (body: { code: string; wallet: { address: string; signature: string; utcTime: string } }) =>
    CoreApiService.post<AuthResponse>('/auth/accept-invitation', body);
  sendInvitation = (id: string, redirectUri: string) =>
    CoreApiService.put(`/recipe/resend/${id}`, { redirectUri: redirectUri });
}

export default new RecipientApiService();
