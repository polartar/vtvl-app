import Chip from '@components/atoms/Chip/Chip';
import { IScheduleOverviewProps } from 'types/models/vesting';

const ScheduleOverview = (props: IScheduleOverviewProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      <div>
        <label>
          <span>Schedule name</span>
        </label>
        <Chip color="gray" label={props.name} rounded size="small" />
      </div>
      <div>
        <label>
          <span>No. of recipients</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.beneficiaries}</p>
      </div>
      <div>
        <label>
          <span>Start</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.startDate}</p>
      </div>
      <div>
        <label>
          <span>End</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.endDate}</p>
      </div>
      <div>
        <label>
          <span>Cliff release</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.cliff}</p>
      </div>
      <div>
        <label>
          <span>Linear release</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.linearRelease}</p>
      </div>
      <div>
        <label>
          <span>Vesting allocation</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.totalAllocated}</p>
      </div>
    </div>
  );
};

export default ScheduleOverview;
