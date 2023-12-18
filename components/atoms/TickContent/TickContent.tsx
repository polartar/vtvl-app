/**
 * TickContent component
 * This is intended to be used as a child component for UI that needs to display dynamic changes on data points
 * Example is in the BarLineChart where the data compares changes in price and claims
 */
import ProfitLossIcon from 'public/icons/profit-loss-icon.svg';
import { twMerge } from 'tailwind-merge';

import Chip from '../Chip/Chip';
import Hint from '../Hint/Hint';
import { Typography } from '../Typography/Typography';

interface ITickContentProps {
  // Title of the data point
  title: string;
  // Current value of the data point -- normally a price
  value: string;
  // Additional information -- displays a tooltip if it exists -- good for explaining things
  info?: string;
  // Status of the data point whether the value has increased, decreased, neutral or none. Profit and Loss indicators
  status?: 'increase' | 'decrease' | 'neutral' | 'none';
  // What has changed based on the status ie., 2% increase, 3% decrease etc.
  changeText?: string;
}

const TickContent = ({ title, value, info, status = 'none', changeText }: ITickContentProps) => {
  return (
    <div className="flex flex-row items-center gap-1.5 font-medium">
      <Typography size="caption" className="text-neutral-500">
        {title}
      </Typography>
      {info && <Hint tip={info} />}
      {status !== 'none' && (
        <Chip
          label={
            <>
              {status !== 'neutral' ? (
                <ProfitLossIcon className={twMerge('w-3 mr-1', status === 'decrease' ? '-scale-y-1' : '')} />
              ) : (
                '-- '
              )}
              {changeText}
            </>
          }
          color={status === 'increase' ? 'successAlt' : status === 'decrease' ? 'dangerAlt' : 'grayAlt'}
          size="tiny"
          className="mr-1"
        />
      )}
      <div className="flex flex-row items-center gap-1.5">
        <Typography size="caption" className="text-neutral-900">
          {value}
        </Typography>
      </div>
    </div>
  );
};

export default TickContent;
