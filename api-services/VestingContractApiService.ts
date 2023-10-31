import CoreApiService from '@api-services/CoreApiService';
import {
  ICreateVestingContractRequest,
  IDeployVestingContractRequest,
  IVestingContract
} from 'interfaces/vestingContract';

class VestingContractApiService {
  // Token APIs
  createVestingContract = (payload: ICreateVestingContractRequest) =>
    CoreApiService.post<IVestingContract>('/vesting-contract', payload);

  getVestingContractById = (id: string) => CoreApiService.get<IVestingContract>(`/vesting-contract/${id}`);

  updateVestingContract = (id: string, payload: Partial<IVestingContract>) =>
    CoreApiService.put<IVestingContract>(`/vesting-contract/${id}`, payload);

  deployVestingContract = (id: string, payload: IDeployVestingContractRequest) =>
    CoreApiService.put(`/vesting-contract/${id}/deploy`, payload);

  getOrganizationVestingContracts = (organizationId: string) =>
    CoreApiService.get<IVestingContract[]>(`/vesting-contract/organization/${organizationId}`);

  // inviteMember = (payload: IOrgMemberInviteRequest) =>
  //   CoreApiService.post(`/organization/${payload.organizationId}/invite/${PLATFORM_NAME}`, payload);
}

export default new VestingContractApiService();
