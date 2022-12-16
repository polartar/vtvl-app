import format from 'date-fns/format';
import Decimal from 'decimal.js';
import { Timestamp } from 'firebase/firestore';
import { spaceMissions } from 'types/constants/shared';

import { formatNumber } from './token';

/**
 * Converts a single label item into an option with a label and value -- to be used on select inputs
 * values are converted into lower camel case
 */
export const convertLabelToOption = (label: string) => ({
  label,
  value: label
    .toLocaleLowerCase()
    .split(' ')
    .map((word, wIndex) => {
      return wIndex && word ? word[0].toUpperCase() + word.substring(1) : word;
    })
    .join('')
});

/**
 * Converts a list of items into options for the select input
 */
export const convertAllToOptions = (data: string[]) => data.map((item) => convertLabelToOption(item));

/**
 * Converts the date into a human readable one
 */
export const formatDate = (date: Date) => format(date, 'E, LLL d, yyyy');

/**
 * Converts the time into a human readable one
 */
export const formatTime = (date: Date) => format(date, 'h:mm a (O)');
export const formatDateTime = (date: Date) => format(date, 'E, LLL d, yyyy h:mm a (O)');

/**
 * Visually compress the token address
 */
export const minifyAddress = (address: string) =>
  `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;

/**
 * Conversion to currency -- currently used as sample might update this later
 */
export const convertToUSD = (amount: number | Decimal | string) => {
  console.log('CONVERT TO USD', typeof amount);
  return formatNumber(typeof amount === 'number' || typeof amount === 'string' ? +amount * 0.0001 : amount.mul(0.0001));
};

// This function lets us parse the correct date format before displaying and using it across the schedule form and chart.
export interface IActualDateTimeProps {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
  originalEndDateTime: Date | null | undefined;
}
export const getActualDateTime = (data: IActualDateTimeProps) => {
  let startDateTime;
  let endDateTime;
  let originalEndDateTime;
  try {
    // Try first with the presumption that the dates provided are in Timestamp -- came from firebase.
    startDateTime = new Date((data.startDateTime as unknown as Timestamp).toMillis());
    endDateTime = new Date((data.endDateTime as unknown as Timestamp).toMillis());
    originalEndDateTime = new Date(
      ((data.originalEndDateTime ? data.originalEndDateTime : data.endDateTime) as unknown as Timestamp).toMillis()
    );
  } catch (err) {
    // Catch it with the default as if it came from current form data
    startDateTime = data.startDateTime;
    endDateTime = data.endDateTime;
    originalEndDateTime = data.originalEndDateTime || data.endDateTime;
  }
  return {
    startDateTime,
    endDateTime,
    originalEndDateTime
  };
};

// Generates a set of numbers based on the given length
export const generateRandomName = (l = 4) => {
  const length = l;
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  const spaceMission = spaceMissions[Math.floor(Math.random() * spaceMissions.length)];
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${spaceMission}-${result}`;
};
