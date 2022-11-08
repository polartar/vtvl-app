import format from 'date-fns/format';
import Decimal from 'decimal.js';

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

/**
 * Visually compress the token address
 */
export const minifyAddress = (address: string) =>
  `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;

/**
 * Conversion to currency -- currently used as sample might update this later
 */
export const convertToUSD = (amount: number | Decimal) => {
  return formatNumber(typeof amount === 'number' ? amount * 0.0001 : amount.mul(0.0001));
};
