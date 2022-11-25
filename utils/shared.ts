import format from 'date-fns/format';
import Decimal from 'decimal.js';
import { Timestamp } from 'firebase/firestore';

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
export const getActualDateTime = (data: {
  startDateTime: Date | null | undefined;
  endDateTime: Date | null | undefined;
}) => {
  let startDate;
  let endDate;
  try {
    // Try first with the presumption that the dates provided are in Timestamp -- came from firebase.
    startDate = new Date((data.startDateTime as unknown as Timestamp).toMillis());
    endDate = new Date((data.endDateTime as unknown as Timestamp).toMillis());
  } catch (err) {
    // Catch it with the default as if it came from current form data
    startDate = data.startDateTime;
    endDate = data.endDateTime;
  }
  return {
    startDate,
    endDate
  };
};

// Generates a set of numbers based on the given length
export const generateRandomName = (l: number) => {
  const length = l;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
