import add from 'date-fns/add';
import format from 'date-fns/format';
import formatDuration from 'date-fns/formatDuration';
import getUnixTime from 'date-fns/getUnixTime';
import intervalToDuration from 'date-fns/intervalToDuration';
import toDate from 'date-fns/toDate';
import Decimal from 'decimal.js';
import { CliffDuration, DATE_FREQ_TO_TIMESTAMP, ReleaseFrequency } from 'types/constants/schedule-configuration';
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
  const durationOption = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0
  };
  switch (cliffDuration) {
    case '1-minute':
      durationOption.minutes = 1;
      break;
    case '1-hour':
      durationOption.hours = 1;
      break;
    case '6-hours':
      durationOption.hours = 6;
      break;
    case '12-hours':
      durationOption.hours = 12;
      break;
    case '1-day':
      durationOption.days = 1;
      break;
    case '5-days':
      durationOption.days = 5;
      break;
    case '2-weeks':
      durationOption.weeks = 2;
      break;
    case '1-month':
      durationOption.months = 1;
      break;
    case '3-months':
      durationOption.months = 3;
      break;
    case '6-months':
      durationOption.months = 6;
      break;
    case '1-year':
      durationOption.years = 1;
      break;
    case 'no-cliff':
    default:
      break;
  }

  return add(startDate, durationOption);
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

/**
 * Get the frequency interval based on the releaseFrequency value
 * minute, hourly, daily, weekly, monthly or yearly.
 * "start" should be the cliff date time if there is a cliff and start date time none
 */
export const getNumberOfReleases = (frequency: ReleaseFrequency, startDate: Date, endDate: Date) => {
  // Convert dates into integers -- in seconds for better computation.
  const start = getUnixTime(startDate);
  const end = getUnixTime(endDate);
  const cliffToEndDateTime = end - start;
  // Make the number of releases whole number
  return Math.round(cliffToEndDateTime / DATE_FREQ_TO_TIMESTAMP[frequency]);
};

/**
 * Get the projected end date time
 */
export const getProjectedEndDateTime = (
  startDate: Date,
  endDate: Date,
  numberOfReleases: number,
  frequencyInterval: number
) => {
  const endInUnix = getUnixTime(endDate);
  const startInUnix = getUnixTime(startDate);
  const difference = endInUnix - startInUnix;
  const modulusCheck = difference % frequencyInterval;

  // Has a remainder, check to see how many ms to add
  if (modulusCheck) {
    // Allocates the whole release cycle time
    const remaining = frequencyInterval * numberOfReleases - difference;
    const newEndDate = endInUnix + remaining;
    return toDate(newEndDate * 1000);
  }
  return endDate;
};

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

/**
 * Line Chart data
 * Generate an array of line chart data that supports the vesting schedule configuration
 */
export const getChartData = ({
  start,
  end,
  cliffDate,
  cliffDuration,
  cliffAmount,
  frequency,
  numberOfReleases,
  releaseAmount,
  vestedAmount
}: IChartDataTypes) => {
  const frequencyInterval = DATE_FREQ_TO_TIMESTAMP[frequency];
  const actualStart = cliffDuration !== 'no-cliff' ? cliffDate : start;
  const projectedEndDate = getProjectedEndDateTime(actualStart, end, numberOfReleases, frequencyInterval);
  const cliffData = [];
  const releaseData = [];
  // Stores the current amount and be cumulative during interval
  let currentAmount = new Decimal(0).toDP(6, Decimal.ROUND_UP);

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
        date: formatDateTime(projectedEndDate),
        value: vestedAmount.toString()
      });
    } else {
      // Loop based on frequency interval (how many releases)
      for (let i = 0; i < numberOfReleases; i++) {
        // Add option on the uses the exact time
        const addOption = { seconds: DATE_FREQ_TO_TIMESTAMP[frequency] };

        // Add 1 unit of the interval type to the date
        currentDate = add(currentDate, addOption);
        currentAmount = Decimal.add(currentAmount, releaseAmount);

        // Check if current amount is more the the amount to be vested
        releaseData.push({
          date: formatDateTime(currentDate),
          value: currentAmount.toString()
        });
      }
    }
  }
  return { release: releaseData, cliff: cliffData };
};
