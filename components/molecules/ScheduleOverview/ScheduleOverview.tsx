import Chip from '@components/atoms/Chip/Chip';
import { Timestamp } from 'firebase/firestore';
import { IScheduleOverviewProps, IVesting } from 'types/models/vesting';
import { timestampToDateString } from 'utils/date';

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
        <p className="paragraphy-tiny-medium neutral-text">{startDate}</p>
      </div>
      <div>
        <label>
          <span>End</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{endDate}</p>
      </div>
      <div>
        <label>
          <span>Cliff release</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{cliff}</p>
      </div>
      <div>
        <label>
          <span>Linear release</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{linearRelease}</p>
      </div>
      <div>
        <label>
          <span>Vesting allocation</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{totalAllocated}</p>
      </div>
    </div>
  );
};

export default ScheduleOverview;
