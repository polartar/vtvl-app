import CoreApiService from '@api-services/CoreApiService';

class UserApiService {
  getProfile = () => CoreApiService.get<string>('/auth/me');
  updateProfile = (payload: { name: string }) => CoreApiService.put<string>('/user', payload);
}

export default new UserApiService();
