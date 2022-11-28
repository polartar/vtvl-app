import { IScheduleSummaryProps } from 'types/models/vesting';

const ScheduleSummary = (props: IScheduleSummaryProps) => {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
      <div>
        <label>
          <span>Schedule name</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.name || '--'}</p>
      </div>
      <div>
        <label>
          <span>Token per user</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.tokenPerUser}</p>
      </div>
      <div>
        <label>
          <span>Beneficiaries</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.beneficiaries}</p>
      </div>
      <div>
        <label>
          <span>Total Period</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.totalPeriod}</p>
      </div>
      <div>
        <label>
          <span>Created by</span>
        </label>
        <p className="paragraphy-tiny-medium neutral-text">{props.createdBy}</p>
      </div>
    </div>
  );
};

export default ScheduleSummary;
