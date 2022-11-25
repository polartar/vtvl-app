import Chip from '@components/atoms/Chip/Chip';
import { Timestamp } from 'firebase/firestore';
import { IScheduleOverviewProps, IVesting } from 'types/models/vesting';
import { timestampToDateString } from 'utils/date';
import { formatDateTime } from 'utils/shared';
import { formatNumber } from 'utils/token';

const ScheduleOverview = (vesting: IVesting) => {
  const startDate = timestampToDateString((vesting.details.startDateTime as unknown as Timestamp).toMillis());
  const endDate = timestampToDateString((vesting.details.endDateTime as unknown as Timestamp).toMillis());
  const cliff = vesting.details.cliffDuration.split('-').join(' ');
  const linearRelease = vesting.details.releaseFrequency;
  const totalAllocated = vesting.details.amountToBeVested;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      <div>
        <label>
          <span>Schedule name</span>
        </label>
        <Chip color="gray" label={'name'} rounded size="small" />
      </div>
      <div>
        <label>
          <span>No. of recipients</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{vesting.recipients.length}</p>
      </div>
      <div>
        <label>
          <span>Start</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{formatDateTime(new Date(startDate))}</p>
      </div>
      <div>
        <label>
          <span>End</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{formatDateTime(new Date(endDate))}</p>
      </div>
      <div>
        <label>
          <span>Cliff release</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text capitalize">{cliff}</p>
      </div>
      <div>
        <label>
          <span>Linear release</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text capitalize">{linearRelease}</p>
      </div>
      <div>
        <label>
          <span>Vesting allocation</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{formatNumber(totalAllocated)}</p>
      </div>
    </div>
  );
};

export default ScheduleOverview;
