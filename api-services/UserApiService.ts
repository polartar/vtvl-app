import CoreApiService from '@api-services/CoreApiService';
import { PLATFORM_NAME } from '@utils/constants';

class UserApiService {
  getProfile = () => CoreApiService.get<string>('/auth/me');
  updateProfile = (payload: { name: string }) => CoreApiService.put<string>('/user', payload);
}

export default new UserApiService();
