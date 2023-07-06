import format from 'date-fns/format';
import intlFormatDistance from 'date-fns/intlFormatDistance';
import SuccessIcon from 'public/icons/success.svg';
import WarningIcon from 'public/icons/warning.svg';
import { useEffect, useState } from 'react';

interface IActivity {
  text: string;
  date: string | Date;
  icon: string;
}

interface IActivityFeedProps {
  activities: IActivity[];
}

const ActivityFeed = ({ activities = [], ...props }: IActivityFeedProps) => {
  const [height, setHeight] = useState(0);
  const renderDate = (date: string | Date) => {
    if (typeof date === 'object') {
      const newDate = intlFormatDistance(date, new Date());
      return newDate.charAt(0).toUpperCase() + newDate.slice(1) + ' · ' + format(date, 'hh:mm aa');
    }
    return date;
  };

  useEffect(() => {
    setTimeout(() => {
      setHeight((activities.length - 1) * 64);
    }, 600);
  });

  return (
    <div className="relative">
      {activities.map((activity, index) => (
        <div key={`activity-${index}`} className="flex flex-row items-center gap-4 mb-6">
          <div className="rounded-full w-6 h-6 bg-white relative z-10">
            {activity.icon === 'success' ? <SuccessIcon className="w-6 h-6 fill-current text-success-500 " /> : null}
            {activity.icon === 'warning' ? <WarningIcon className="w-6 h-6 fill-current text-warning-500" /> : null}
          </div>
          <div>
            <p className="paragraphy-small-medium text-neutral-700">{activity.text}</p>
            <p className="paragraphy-tiny-medium text-neutral-400">{renderDate(activity.date)}</p>
          </div>
        </div>
      ))}
      <div
        className="w-px border-l border-neutral-300 absolute left-3 top-4 transition-height duration-1000 delay-300"
        style={{ height: `${height}px` }}></div>
    </div>
  );
};

export default ActivityFeed;
