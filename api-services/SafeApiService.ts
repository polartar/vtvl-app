import CoreApiService from '@api-services/CoreApiService';
import { ISafeRequest, ISafeResponse } from 'interfaces/safe';

class SafeApiService {
  getSafeWalletsByOrganization = (organizationId: string) =>
    CoreApiService.get<ISafeResponse[]>(`/safe/organization/${organizationId}`);
  getSafeWalletsByAddress = (address: string) => CoreApiService.get<ISafeResponse>(`/safe/wallet/${address}`);
  getSafeWallet = (organizationId: string, address: string) =>
    CoreApiService.get<ISafeResponse>(`/safe/get/single?organizationId=${organizationId}&address=${address}`);
  addSafeWallet = (payload: ISafeRequest) => CoreApiService.post<ISafeResponse>('/safe/wallet', payload);
  updateSafeWallet = (payload: ISafeRequest) =>
    CoreApiService.put<ISafeResponse>(`/safe/wallet/${payload.safeId}`, payload);
}

export default new SafeApiService();
