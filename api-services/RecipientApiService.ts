import CoreApiService from '@api-services/CoreApiServiceTemp';
import { PLATFORM_NAME } from '@utils/constants';
import { IRecipient } from 'types/models';

class RecipientApiService {
  // Organization APIs
  getRecipes = (query: string) => CoreApiService.get<IRecipient[]>(`/recipe/list?${query}`);
}

export default new RecipientApiService();
