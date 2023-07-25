import { IVestingSchedule } from 'interfaces/vestingSchedule';

import CoreApiService from './CoreApiService';

class VestingScheduleApiService {
  // Organization APIs
  createVestingSchedule = (payload: IVestingSchedule) => CoreApiService.post<IVestingSchedule>('/vesting', payload);
  getVestingSchedules = (organizationId: string) =>
    CoreApiService.get<IVestingSchedule[]>(`/vesting/organization/${organizationId}`);
  getVestingSchedule = (id: string) => CoreApiService.get<IVestingSchedule>(`/vesting/${id}`);
}

export default new VestingScheduleApiService();
