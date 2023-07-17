import CoreApiService from '@api-services/CoreApiServiceTemp';
import { IRecipient } from 'types/models';

class RecipientApiService {
  // Organization APIs
  getRecipients = (query: string) => CoreApiService.get<IRecipient[]>(`/recipe/list?${query}`);
  updateRecipient = (id: string, body: any) => CoreApiService.patch<IRecipient>(`/recipe/${id}`, body);
}

export default new RecipientApiService();
