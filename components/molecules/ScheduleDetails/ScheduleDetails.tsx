import Chip from '@components/atoms/Chip/Chip';
import EmptyState from '@components/atoms/EmptyState/EmptyState';
import Hint from '@components/atoms/Hint/Hint';
import format from 'date-fns/format';
import { Timestamp } from 'firebase/firestore';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CliffDuration, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { formatDate, formatTime } from 'utils/shared';
import { formatNumber } from 'utils/token';
import {
  getChartData,
  getCliffAmount,
  getCliffDateTime,
  getDuration,
  getNumberOfReleases,
  getReleaseAmount,
  getReleaseFrequencyLabel
} from 'utils/vesting';

type DateTimeType = Date | null | undefined;

interface ScheduleDetailProps extends React.AllHTMLAttributes<HTMLDivElement> {
  label?: string;
  startDateTime: DateTimeType;
  endDateTime: DateTimeType;
  cliffDuration: CliffDuration;
  lumpSumReleaseAfterCliff: string | number;
  releaseFrequency: ReleaseFrequency;
  amountToBeVested: number;
  hint?: boolean;

  /**
   * Token - what is the token symbol / name being vested.
   */
  token: string;
  layout?: 'small' | 'default';
  includeDetails?: boolean;
}

const ScheduleDetails = ({
  label = '',
  startDateTime,
  endDateTime,
  cliffDuration,
  lumpSumReleaseAfterCliff,
  releaseFrequency,
  amountToBeVested,
  token,
  layout = 'default',
  hint = true,
  includeDetails = true,
  ...props
}: ScheduleDetailProps) => {
  /**
   * Add in computed values bases on the props that are passed from the vesting schedule configuration.
   */

  const duration = startDateTime && endDateTime ? getDuration(startDateTime as Date, endDateTime) : '';
  const cliffDate = startDateTime ? getCliffDateTime(startDateTime, cliffDuration) : '';
  const cliffAmount = getCliffAmount(cliffDuration, +lumpSumReleaseAfterCliff, +amountToBeVested);
  const numberOfReleases =
    startDateTime && endDateTime ? getNumberOfReleases(releaseFrequency, cliffDate || startDateTime, endDateTime) : 0;
  const releaseAmount = getReleaseAmount(+amountToBeVested, cliffAmount, numberOfReleases);

  const chartData = getChartData({
    start: startDateTime || new Date(),
    end: endDateTime || new Date(),
    cliffDuration,
    cliffAmount,
    frequency: releaseFrequency,
    vestedAmount: +amountToBeVested
  });

  const hasChartValidValues = () => {
    return chartData.release.length > 1 && chartData.release.filter((rel) => rel.value !== '0').length;
  };

  // const actualStartDateTime = cliffDuration !== 'no-cliff' ? cliffDate : startDateTime;
  // const projectedEndDateTime =
  //   endDateTime && actualStartDateTime
  //     ? getProjectedEndDateTime(actualStartDateTime, endDateTime, numberOfReleases, releaseFrequency)
  //     : null;

  const singleLineFrequencies = ['continuous', 'minute', 'hourly'];

  const formatTick = (value: string) => {
    let dateFormat = '';
    switch (releaseFrequency) {
      case 'continuous':
        dateFormat = 'M/d/yy h:mm:ss aaa';
        break;
      case 'minute':
        dateFormat = 'M/d/yy h:mm:ss aaa';
        break;
      case 'hourly':
        dateFormat = 'M/d/yy h:mm aaa';
        break;
      case 'daily':
        dateFormat = 'MMM d yyyy';
        break;
      case 'weekly':
        dateFormat = 'MMM d yyyy';
        break;
      case 'monthly':
      case 'quarterly':
        dateFormat = 'MMM yyyy';
        break;
      case 'yearly':
        dateFormat = 'yyyy';
        break;
      default:
        {
          // every-1-days, every-2-days & every-4-weeks
          const splitFrequencyValue = releaseFrequency.split('-')[2];
          const formats: Record<string, string> = {
            continuous: 'M/d/yy h:mm aaa',
            minutes: 'M/d/yy h:mm aaa',
            hours: 'M/d/yy h:mm aaa',
            days: 'MMM d yyyy',
            weeks: 'MMM d yyyy',
            months: 'MMM yyyy',
            years: 'yyyy'
          };
          dateFormat = formats[splitFrequencyValue];
        }
        break;
    }
    return format(new Date(value), dateFormat);
  };

  return (
    <>
      {label ? (
        <label className="mb-5">
          <span className="flex flex-row items-center gap-2">
            Schedule Details {duration ? <Chip color="default" rounded label={duration} /> : null}
          </span>
        </label>
      ) : null}
      {/**
       * Responsive Container needs to have a dimension -- coming from the parent element.
       * However, we are not ensured that the parent always has width and height.
       * This will force the responsive container to have a dynamic width and height.
       */}
      {hasChartValidValues() ? (
        <ResponsiveContainer width={'99%'} height={300}>
          <LineChart width={300} height={300}>
            <CartesianGrid stroke="#d0d5dd" strokeDasharray="0 0" />
            <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} tickFormatter={formatTick} />
            <YAxis
              allowDataOverflow={true}
              dataKey="value"
              domain={[0, amountToBeVested]}
              tickFormatter={(value) => formatNumber(value, 0).toString()}
            />
            <Tooltip formatter={(value, name, props) => formatNumber(parseFloat(value.toString()), 6)} />
            <Line
              type="stepAfter"
              data={chartData.cliff}
              dataKey="value"
              name="Cliff"
              stroke="var(--primary-900)"
              strokeWidth={2}
              dot={{ fill: 'var(--secondary-900)', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'var(--secondary-900)', strokeWidth: 0, r: 4 }}
            />
            <Line
              type={singleLineFrequencies.includes(releaseFrequency) || numberOfReleases > 60 ? 'linear' : 'stepAfter'}
              data={chartData.release}
              dataKey="value"
              name="Linear release"
              stroke="var(--primary-900)"
              strokeWidth={2}
              dot={{ fill: 'var(--secondary-900)', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'var(--secondary-900)', strokeWidth: 0, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          image="/images/blockchain-technology.gif"
          imageSize="small"
          title="No schedule details yet"
          description={
            <>
              Make sure that the vesting schedule
              <br />
              fields are filled correctly.
            </>
          }
        />
      )}
      <div className={`grid gap-3 mt-5 ${layout === 'small' ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4 '}`}>
        <label>
          <span>Cliff</span>
          <p className="flex flex-row items-start gap-2 text-xs">
            <img src="/icons/graph-stairs.svg" className="w-6 h-6" alt="Cliff" />
            {formatNumber(cliffAmount)} {token}
          </p>
        </label>
        <label>
          <span>Linear Release</span>
          <p className="flex flex-row items-start gap-2 text-xs">
            <img src="/icons/graph-line.svg" className="w-6 h-6" alt="Cliff" />
            {formatNumber(releaseAmount)} {token} /{getReleaseFrequencyLabel(releaseFrequency)}
          </p>
        </label>
        <label>
          <span>Start</span>
          <p className="flex flex-row items-start gap-2 text-xs">
            <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
            {startDateTime ? (
              <>
                {formatDate(startDateTime)}
                <br />
                {formatTime(startDateTime)}
              </>
            ) : null}
          </p>
        </label>
        <label>
          <span>End</span>
          <p className="flex flex-row items-start gap-2 text-xs">
            <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
            {chartData.projectedEndDateTime ? (
              <>
                {formatDate(chartData.projectedEndDateTime)}
                <br />
                {formatTime(chartData.projectedEndDateTime)}
              </>
            ) : null}
            {/* <Hint tip="This is exact end date and time.<br />Adjusted based on frequency interval." /> */}
          </p>
        </label>
      </div>
    </>
  );
};

export default ScheduleDetails;
