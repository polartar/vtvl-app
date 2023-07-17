import { IVestingSchedule } from 'interfaces/vestingSchedule';

import CoreApiServiceTemp from './CoreApiServiceTemp';

class VestingScheduleApiService {
  // Organization APIs
  createVestingSchedule = (payload: IVestingSchedule) => CoreApiServiceTemp.post<IVestingSchedule>('/vesting', payload);
  getVestingSchedules = (organizationId: string) =>
    CoreApiServiceTemp.get<IVestingSchedule[]>(`/vesting/organization/${organizationId}`);
}

export default new VestingScheduleApiService();
