import CoreApiService from '@api-services/CoreApiService';
import { PLATFORM_NAME } from '@utils/constants';
import { IVestingSchedule } from 'interfaces/vestingSchedule';

class VestingScheduleApiService {
  // Organization APIs
  createVestingSchedule = (payload: IVestingSchedule) => CoreApiService.post<IVestingSchedule>('/vesting', payload);
}

export default new VestingScheduleApiService();
