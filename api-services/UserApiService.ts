import MainApiService from '@api-services/MainApiService';

class UserApiService {
  getProfile = () => MainApiService.get<string>('/auth/me');
  updateProfile = (payload: { name: string }) => MainApiService.put<string>('/user', payload);
}

export default new UserApiService();
