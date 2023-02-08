import add from 'date-fns/add';
import differenceInHours from 'date-fns/differenceInHours';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import eachHourOfInterval from 'date-fns/eachHourOfInterval';
import eachMinuteOfInterval from 'date-fns/eachMinuteOfInterval';
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval';
import eachQuarterOfInterval from 'date-fns/eachQuarterOfInterval';
import eachWeekOfInterval from 'date-fns/eachWeekOfInterval';
import eachYearOfInterval from 'date-fns/eachYearOfInterval';
import format from 'date-fns/format';
import formatDuration from 'date-fns/formatDuration';
import getUnixTime from 'date-fns/getUnixTime';
import intervalToDuration from 'date-fns/intervalToDuration';
import Decimal from 'decimal.js';
import { CliffDuration, DateDurationOptionsPlural, ReleaseFrequency } from 'types/constants/schedule-configuration';
import { IChartDataTypes } from 'types/vesting';

/**
 * Quick function to format everything to align every record of the chart
 */
export const formatDateTime = (date: Date) => {
  return format(date, 'LLL d, yyyy h:mm:ss aa');
};

/**
 * How many days? weeks? months?
 * value is in seconds
 * duration is computed from (end date time) - (start date time)
 */
export const getDuration = (start: Date, end: Date): string => {
  const duration = intervalToDuration({ end, start });
  return formatDuration(duration, { delimiter: ', ', format: ['years', 'months', 'days', 'hours'] });
};

/**
 * Cliff - the duration on when the cliff amount will be provided.
 * cliff is computed from (start date time) + cliff duration (2 mins, 1 hour, 1 month etc) - this point in time.
 */
export const getCliffDateTime = (startDate: Date, cliffDuration: CliffDuration) => {
  const durationInput = cliffDuration.split('-');
  const durationNumber = +durationInput[0];
  const durationDate = durationInput[1];

  // Default option before adding to actual dates
  const durationOption = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0
  };

  if (durationDate.includes('year')) {
    durationOption.years = durationNumber;
  } else if (durationDate.includes('month')) {
    durationOption.months = durationNumber;
  } else if (durationDate.includes('week')) {
    durationOption.weeks = durationNumber;
  } else if (durationDate.includes('day')) {
    durationOption.days = durationNumber;
  } else if (durationDate.includes('hour')) {
    durationOption.hours = durationNumber;
  } else if (durationDate.includes('minute')) {
    durationOption.minutes = durationNumber;
  }

  return add(startDate, durationOption);
};

/**
 * Get the timestamp based on the cliffDuration
 * Our technique is to utilize the date-fns add function so that we'll have accurate timestamps especially when dealing with leap years.
 * We also reference the start date for additional accuracy
 */
export const getCliffDurationTimestamp = (cliffDuration: CliffDuration, startDate: Date) => {
  // Add start date and cliff duration
  const cliffDurationDate = getCliffDateTime(startDate, cliffDuration);
  // Convert to seconds start date
  const startDateSeconds = getUnixTime(startDate);
  // Convert to seconds start date + cliff duration
  const cliffDurationDateSeconds = getUnixTime(cliffDurationDate);
  // Subtract
  const cliffDurationTimestamp = cliffDurationDateSeconds - startDateSeconds;

  console.log('All about durations', cliffDuration, startDateSeconds, cliffDurationDateSeconds, cliffDurationTimestamp);
  return cliffDurationTimestamp;
};

/**
 * Cliff amount - lumpsum amount before each release.
 * cliff amount is computed from (% of amount to be vested)
 * Example:
 * - Amount to be vested = 100,000
 * - Lumpsum release = 25%
 * - Cliff amount is 25,000
 */
export const getCliffAmount = (
  cliffDuration: CliffDuration,
  amountAfterCliff: number,
  amountToBeVested: number
): number => {
  if (amountAfterCliff && cliffDuration !== 'no-cliff') {
    return +amountToBeVested * (+amountAfterCliff / 100);
  }
  return 0;
};

// Decimal version of getCliffAmount
export const getCliffAmountDecimal = (
  cliffDuration: CliffDuration,
  amountAfterCliff: Decimal,
  amountToBeVested: Decimal
) => {
  if (amountAfterCliff && cliffDuration !== 'no-cliff') {
    return amountToBeVested.times(amountAfterCliff.div(new Decimal(100)));
  }
  return new Decimal(0);
};

/**
 * This function is intended to get the release frequency timestamp
 * the purpose of this is to accurately add dates before computing the timestamp
 */
export const getReleaseFrequencyTimestamp = (
  startDate: Date,
  endDate: Date,
  releaseFrequency: ReleaseFrequency,
  cliffDuration?: CliffDuration
) => {
  // When cliff duration is provide, get the cliff date time first as the actual start date
  const actualStartDateTime =
    cliffDuration && cliffDuration !== 'no-cliff' ? getCliffDateTime(startDate, cliffDuration) : startDate;

  const intervals = getNumberOfReleases(releaseFrequency, actualStartDateTime, endDate);
  const intervalSeconds = Math.round((getUnixTime(endDate) - getUnixTime(actualStartDateTime)) / intervals); //startWithIntervalSeconds - getUnixTime(actualStartDateTime);

  console.log('FREQUENCY TIMESTAMP', startDate, endDate, intervalSeconds);
  return intervalSeconds;
};

/**
 * Function to display the correct label based on release frequency value
 */
export const getReleaseFrequencyLabel = (releaseFrequency: ReleaseFrequency) => {
  switch (releaseFrequency) {
    case 'continuous':
      return 'second';
    case 'hourly':
      return 'hour';
    case 'daily':
      return 'day';
    case 'weekly':
      return 'week';
    case 'monthly':
      return 'month';
    case 'quarterly':
      return 'quarter';
    case 'yearly':
      return 'year';
    default: {
      // every-1-days, every-2-days & every-4-weeks
      const splitFrequencyValue = releaseFrequency.split('-')[2];
      // Remove 's' on all labels
      return splitFrequencyValue.slice(0, -1);
    }
  }
};

/**
 * Make the frequency -- especially custom ones -- human readable
 */
export const humanizeFrequency = (releaseFrequency: ReleaseFrequency) => {
  // Custom ones
  if (releaseFrequency.includes('-')) {
    // every-1-days, every-2-days & every-4-weeks
    const splitFrequencyValue = releaseFrequency.split('-');
    const count = +splitFrequencyValue[1];
    const duration = splitFrequencyValue[2];
    if (count === 1) {
      switch (duration) {
        case 'seconds':
          return 'second';
        case 'hours':
          return 'hourly';
        case 'days':
          return 'daily';
        case 'weeks':
          return 'weekly';
        case 'months':
          return 'monthly';
        case 'years':
          return 'yearly';
        default:
          return `every ${count} ${duration}`;
      }
    }
  }
  return releaseFrequency;
};

/**
 * Get the frequency interval based on the releaseFrequency value
 * minute, hourly, daily, weekly, monthly or yearly.
 * "start" should be the cliff date time if there is a cliff and start date time none
 */
export const getNumberOfReleases = (frequency: ReleaseFrequency, startDate: Date, endDate: Date) => {
  // Convert dates into integers -- in seconds for better computation.
  let intervals: any = [];
  const start = startDate;
  const end = endDate;
  const diffHours = differenceInHours(end, start);

  // Always make sure that the end date time should be at least 24 hours after start date time
  if (diffHours >= 24) {
    switch (frequency) {
      case 'continuous':
        intervals = eachMinuteOfInterval({ start, end });
        break;
      case 'hourly':
        intervals = eachHourOfInterval({ start, end });
        break;
      case 'daily':
        intervals = eachDayOfInterval({ start, end });
        break;
      case 'weekly':
        intervals = eachWeekOfInterval({ start, end });
        break;
      case 'monthly':
        intervals = eachMonthOfInterval({ start, end });
        break;
      case 'quarterly':
        intervals = eachQuarterOfInterval({ start, end });
        break;
      case 'yearly':
        intervals = eachYearOfInterval({ start, end });
        break;
      default:
        {
          if (frequency) {
            // every-1-days, every-2-days & every-4-weeks
            const splitFrequencyValue = frequency.split('-');
            const count = splitFrequencyValue[1];
            const duration = splitFrequencyValue[2];
            // trim down the day intervals based on the count value
            switch (duration) {
              case 'days':
                intervals = trimIntervals(eachDayOfInterval({ start, end }), +count);
                break;
              case 'weeks':
                intervals = trimIntervals(eachWeekOfInterval({ start, end }), +count);
                break;
              case 'months':
                intervals = trimIntervals(eachMonthOfInterval({ start, end }), +count);
                break;
              case 'years':
                intervals = trimIntervals(eachYearOfInterval({ start, end }), +count);
                break;
              default:
                break;
            }
          }
        }
        break;
    }
  }

  // Return the number of intervals
  console.log('INTERVALS', intervals.length, intervals);
  return intervals.length - 1;
};

/**
 * This function is used to trim down the intervals date recordset based on the number of releases.
 * This is very useful especially in trimming down for custom release frequencies.
 * @param data
 * @param every
 * @returns
 */
const trimIntervals = (data: Date[], every: number) => {
  const newIntervals: Date[] = [];

  // Loop through the data and increment per the number
  for (let i = 0; i < data.length; i = i + every) {
    newIntervals.push(data[i]);
  }

  return newIntervals;
};

/**
 * Get the projected end date time
 * Currently scrapped due to inaccuracy
 */
// export const getProjectedEndDateTime = (
//   startDate: Date,
//   endDate: Date,
//   numberOfReleases: number,
//   frequency: ReleaseFrequency
// ) => {
//   const endInUnix = getUnixTime(endDate);
//   const startInUnix = getUnixTime(startDate);
//   const difference = differenceInSeconds(endDate, startDate);
//   const frequencyInterval = DATE_FREQ_TO_TIMESTAMP[frequency];
//   const modulusCheck = difference % frequencyInterval;

//   // Has a remainder, check to see how many ms to add
//   if (modulusCheck) {
//     const toAddOneDay = ['monthly', 'quarterly', 'yearly'];
//     // Allocates the whole release cycle time
//     const remaining = frequencyInterval * numberOfReleases - difference;
//     const newEndDate = endInUnix + remaining + (toAddOneDay.includes(frequency) ? DATE_FREQ_TO_TIMESTAMP.daily : 0);
//     return toDate(newEndDate * 1000);
//   }
//   return endDate;
// };

/**
 * Release amount - how much is being released aligned with frequency.
 * Release amount is computed from:
 * - Total release amount = amount to be vested - cliff amount
 * - How many releases = (end date time - cliff date time) / release frequency
 * - Release amount = total release amount / how many releases
 */
export const getReleaseAmount = (amountToBeVested: number, cliffAmount: number, numberOfReleases: number) => {
  const releaseAmount = amountToBeVested - cliffAmount;
  const totalReleaseAmount = releaseAmount / numberOfReleases;
  return new Decimal(totalReleaseAmount).toDP(6, Decimal.ROUND_UP);
};

// Decimal version of get release amount
export const getReleaseAmountDecimal = (amountToBeVested: Decimal, cliffAmount: Decimal, numberOfReleases: number) => {
  const releaseAmount = amountToBeVested.minus(cliffAmount);
  const totalReleaseAmount = releaseAmount.div(numberOfReleases);
  return totalReleaseAmount.toDP(6, Decimal.ROUND_UP);
};

/**
 * Frequency duration options to add for exact dates
 */
export const getFrequencyDuration = (startDate: Date, releaseFrequency: ReleaseFrequency) => {
  const durationOption = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  switch (releaseFrequency) {
    case 'continuous':
      durationOption.seconds = 1;
      break;
    case 'minute':
      durationOption.minutes = 1;
      break;
    case 'hourly':
      durationOption.hours = 1;
      break;
    case 'daily':
      durationOption.days = 1;
      break;
    case 'weekly':
      durationOption.weeks = 1;
      break;
    case 'monthly':
      durationOption.months = 1;
      break;
    case 'quarterly':
      durationOption.months = 3;
      break;
    case 'yearly':
      durationOption.years = 1;
      break;
    default:
      {
        // every-1-days, every-2-days & every-4-weeks
        const splitFrequencyValue = releaseFrequency.split('-');
        const count = splitFrequencyValue[1];
        const duration = splitFrequencyValue[2];
        // Update corresponding date option and its value
        durationOption[duration as DateDurationOptionsPlural] = +count;
      }
      break;
  }

  return add(startDate, durationOption);
};

/**
 * Line Chart data
 * Generate an array of line chart data that supports the vesting schedule configuration
 */
export const getChartData = ({ start, end, cliffDuration, cliffAmount, frequency, vestedAmount }: IChartDataTypes) => {
  const cliffDate = getCliffDateTime(start, cliffDuration);
  const actualStart = cliffDuration !== 'no-cliff' ? cliffDate : start;
  // const projectedEndDate = getProjectedEndDateTime(actualStart, end, numberOfReleases, frequency);
  const numberOfReleases = getNumberOfReleases(frequency, actualStart, end);
  const releaseAmount = getReleaseAmount(+vestedAmount, +cliffAmount, numberOfReleases);
  const cliffData = [];
  const releaseData = [];
  // Stores the current amount and be cumulative during interval
  let currentAmount = new Decimal(0).toDP(6, Decimal.ROUND_UP);

  // Stores the projected End date time for the last record in the vesting chart
  let projectedEndDateTime = end;

  // Current date and will also be cumulative during interval.
  let currentDate = start;

  if (start && end && cliffDate) {
    if (cliffDuration !== 'no-cliff') {
      // Set base on cliff
      cliffData.push({
        date: formatDateTime(currentDate),
        value: 0
      });
      // Add the amount based on cliff
      currentAmount = Decimal.add(currentAmount, cliffAmount);
      currentDate = cliffDate;
      // Then add the cliff date with the new value
      cliffData.push({
        date: formatDateTime(currentDate),
        value: currentAmount.toString()
      });
      // Add also to release data to place a dot in the cliff as the starting point of the linear release
      releaseData.push({
        date: formatDateTime(currentDate),
        value: currentAmount.toString()
      });
    } else {
      // Add in a zero value as initial dot in the line chart
      releaseData.push({
        date: formatDateTime(currentDate),
        value: currentAmount.toString()
      });
    }

    // This is used to determine a linear vs stepAfter (staircase style) type of line chart
    // On /second /min /hour, we should be using only 1 point which is the end point
    const singleLineFrequencies = ['continuous', 'minute', 'hourly'];
    if (singleLineFrequencies.includes(frequency) || numberOfReleases > 60) {
      // The total amount to be vested
      releaseData.push({
        date: formatDateTime(end),
        value: vestedAmount.toString()
      });
    } else {
      // Loop based on frequency interval (how many releases)
      for (let i = 0; i < numberOfReleases; i++) {
        // Add option on the uses the exact time based on the current date and frequency
        // Add 1 unit of the interval type to the date
        currentDate = getFrequencyDuration(currentDate, frequency);
        currentAmount = Decimal.add(currentAmount, releaseAmount);

        // Check if current amount is more the the amount to be vested
        releaseData.push({
          date: formatDateTime(currentDate),
          value: currentAmount.toString()
        });

        // Update the projected end date
        if (i === numberOfReleases - 1) projectedEndDateTime = currentDate;
      }
    }
  }
  // Move the projected end date time here
  return { release: releaseData, cliff: cliffData, projectedEndDateTime };
};

/**
 * Get the total allocation of an individual recipient in a vesting schedule
 */
export const getIndividualTotalAllocation = (amountVested: number | Decimal, numberOfRecipients: number) => {
  return new Decimal(amountVested).div(new Decimal(numberOfRecipients)).toDP(6, Decimal.ROUND_UP);
};

/**
 * Get the date and time of the next unlocked token
 */
export const getNextUnlock = (
  projectedEndDateTime: Date,
  releaseFrequency: ReleaseFrequency,
  // Can be treated as the start date time
  cliffDateTime: Date
) => {
  // Get cliff date time to compare
  // Check current date time if it's within the cliff date time
  const currentDateTimeSeconds = getUnixTime(new Date());
  const cliffDateTimeSeconds = getUnixTime(cliffDateTime);
  const projectedEndDateTimeSeconds = getUnixTime(projectedEndDateTime);
  // If so, use the cliff release date time as the next unlock (as seconds countdown)
  if (currentDateTimeSeconds < cliffDateTimeSeconds) {
    return cliffDateTimeSeconds - currentDateTimeSeconds;
  } else {
    // If not, use the projected end date time and subtract the current date time (as seconds)
    const remainingDateTimeSeconds = projectedEndDateTimeSeconds - currentDateTimeSeconds;
    const frequencyTimestamp = getReleaseFrequencyTimestamp(cliffDateTime, projectedEndDateTime, releaseFrequency);
    // then, divide the subtracted result into the release frequency
    const remainder = remainingDateTimeSeconds % frequencyTimestamp;
    if (remainder) {
      // If remainder has value, use the remainder as the countdown for the next unlock
      return remainder;
    } else {
      // If the remainder is 0, find the next unlock by adding the current date time to the release frequency
      return frequencyTimestamp;
    }
  }
};
