import CoreApiService from '@api-services/CoreApiService';

class RevokingApiService {
  getRevokings = (organizationId: string, chainId: number) =>
    CoreApiService.get<IRevoking[]>(`/revoking/list?organizationId=${organizationId}&chainId=${chainId}`);
  createRevoking = (data: Partial<IRevokingRequest>) => CoreApiService.post<IRevoking>('/revoking', data);
  updateRevoking = (id: string, data: Partial<IRevoking>) => CoreApiService.put<IRevoking>(`/revoking/${id}`, data);
  getUserRevokings = (organizationId: string, chainId: number, vestingId: string, recipeId: string) =>
    CoreApiService.get<IRevoking[]>(
      `/revoking/list?organizationId=${organizationId}&chainId=${chainId}&vestingId=${vestingId}&recipeId=${recipeId}`
    );
  getRevokingsByQuery = (query: string) => CoreApiService.get<IRevoking[]>(`/revoking/list?${query}`);
}

export default new RevokingApiService();
