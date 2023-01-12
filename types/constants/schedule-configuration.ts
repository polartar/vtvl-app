export type DateDurationOptions = 'hour' | 'day' | 'week' | 'month' | 'year';
export type DateDurationOptionsPlural = `${DateDurationOptions}s`;
export type DateDurationOptionValues = DateDurationOptions | DateDurationOptionsPlural;
export type CliffDuration = 'no-cliff' | `${number}-${DateDurationOptionValues}`;

export type ReleaseFrequency =
  | 'continuous'
  | 'minute'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | `every-${number}-${DateDurationOptionValues}`;

export enum DateFrequencies {
  CONTINUOUS = 'continuous',
  MINUTE = 'minute',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export const DATE_FREQ_TO_LABEL = {
  [DateFrequencies.CONTINUOUS]: 'second',
  [DateFrequencies.MINUTE]: 'minute',
  [DateFrequencies.HOURLY]: 'hour',
  [DateFrequencies.DAILY]: 'day',
  [DateFrequencies.WEEKLY]: 'week',
  [DateFrequencies.MONTHLY]: 'month',
  [DateFrequencies.QUARTERLY]: 'quarter',
  [DateFrequencies.YEARLY]: 'year'
};

export const DATE_FREQ_TO_OPTION = {
  [DateFrequencies.CONTINUOUS]: 'continuous',
  [DateFrequencies.MINUTE]: 'minutes',
  [DateFrequencies.HOURLY]: 'hours',
  [DateFrequencies.DAILY]: 'days',
  [DateFrequencies.WEEKLY]: 'weeks',
  [DateFrequencies.MONTHLY]: 'months',
  [DateFrequencies.QUARTERLY]: 'quarters',
  [DateFrequencies.YEARLY]: 'years'
};

export const CLIFFDURATION_TIMESTAMP: { [key in CliffDuration]: number } = {
  'no-cliff': 0,
  // '1-minute': 60,
  '1-hour': 3600,
  '6-hours': 21600,
  '12-hours': 43200,
  '1-day': 86400,
  '5-days': 432000,
  '2-weeks': 1209600,
  // '1-month': 2592000,
  '1-month': 2628000,
  // '3-months': 7776000,
  '3-months': 7884000,
  // '6-months': 15552000,
  '6-months': 15768000,
  // '1-year': 31104000
  '1-year': 31536000
};

export const DATE_FREQ_TO_TIMESTAMP: { [key in DateFrequencies]: number } = {
  continuous: 1,
  minute: 60,
  hourly: 3600,
  daily: 86400,
  // Average monthly 30.416667 days
  monthly: 2628000,
  quarterly: 7884000,
  // 2678400 31 days
  // 2592000 30 days
  // 2505600 29 days
  // 2419200 28 days
  weekly: 604800,
  // 365 days
  yearly: 31536000
  // yearly: 31622400
  // yearly: 31556952
};
