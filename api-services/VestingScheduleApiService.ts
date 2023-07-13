import { IVestingSchedule } from 'interfaces/vestingSchedule';

import CoreApiServiceTemp from './CoreApiServiceTemp';

class VestingScheduleApiService {
  // Organization APIs
  createVestingSchedule = (payload: IVestingSchedule) => CoreApiServiceTemp.post<IVestingSchedule>('/vesting', payload);
}

export default new VestingScheduleApiService();
