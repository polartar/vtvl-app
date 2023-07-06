import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';

interface IActivity {
  text: string | string[] | JSX.Element | JSX.Element[];
  icon: string;
}

interface IActivityFeedProps {
  activities: IActivity[];
}

const AdditionalInformation = ({ activities = [], ...props }: IActivityFeedProps) => {
  return (
    <div className="relative">
      {activities.map((activity, index) => (
        <div key={`activity-${index}`} className="flex flex-row items-center gap-4 mb-6">
          <div className="rounded-full w-6 h-6 bg-white relative z-10">
            {activity.icon === 'success' ? <SuccessIcon className="w-6 h-6 fill-current text-success-500 " /> : null}
            {activity.icon === 'warning' ? <WarningIcon className="w-6 h-6 fill-current text-warning-500" /> : null}
          </div>
          <div>
            <p className="paragraphy-small text-neutral-500">{activity.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdditionalInformation;
