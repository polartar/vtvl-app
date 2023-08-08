import { transformVestingPayload } from '@utils/vesting';
import { IVestingSchedule } from 'interfaces/vestingSchedule';
import { IVesting } from 'types/models';

import CoreApiService from './CoreApiService';

class VestingScheduleApiService {
  createVestingSchedule = (payload: IVestingSchedule) => CoreApiService.post<IVestingSchedule>('/vesting', payload);
  updateVestingSchedule = (data: IVesting, id: string) =>
    // Do OLD schema to NEW transformation here in the payload
    CoreApiService.put<IVestingSchedule>(`/vesting/${id}`, transformVestingPayload(data));
  removeVestingSchedule = (id: string) => CoreApiService.delete(`/vesting/${id}`);
  getVestingSchedules = (organizationId: string) =>
    CoreApiService.get<IVestingSchedule[]>(`/vesting/organization/${organizationId}`);
  getVestingSchedule = (id: string) => CoreApiService.get<IVestingSchedule>(`/vesting/${id}`);
}

export default new VestingScheduleApiService();
