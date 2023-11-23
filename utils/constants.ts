import { IRecipientType } from 'types/models/recipient';
import { IRole } from 'types/models/settings';

function parseBoolean(envValue: string | undefined, defaultValue = 'false') {
  return Boolean(JSON.parse(envValue ?? defaultValue));
}

// Function ABIs
export const REVOKE_CLAIM_FUNCTION_ABI = 'function revokeClaim(address _recipient)';
export const CREATE_VESTING_CONTRACT_ABI = 'function createVestingContract(address _tokenAddress)';
export const INVITEE_EXPIRED_TIME = Number(process.env.NEXT_PUBLIC_INVITEE_EXPIRED_TIME) || 3600 * 6; // 6 hours
// Uses the declared NEXT_PUBLIC_DOMAIN_NAME for develop, staging, production
// and uses the VERCEL_URL for vercel previews to make vercel deployments testable
export const PUBLIC_DOMAIN_NAME =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_DOMAIN_NAME ?? 'https://' + process.env.VERCEL_URL
    : window?.location?.origin;

export const RECIPIENTS_TYPES = [
  { label: 'Advisor', value: IRole.ADVISOR },
  { label: 'Founder', value: IRole.FOUNDER },
  { label: 'Investor', value: IRole.INVESTOR },
  { label: 'Employee', value: IRole.EMPLOYEE }
] as IRecipientType[];

const RECIPIENTS_VALUES = RECIPIENTS_TYPES.map(({ value }) => value);

// Flag values
export const IS_ENABLED_AUTH_BY_ORG = parseBoolean(process.env.NEXT_PUBLIC_ENABLE_LOGIN_BY_ORGANIZATION);

declare global {
  type IRecipientTypeValue = typeof RECIPIENTS_VALUES[number];
}

export const CACHE_KEY = 'vtvl_cache';

// Email related data
export const WEBSITE_NAME = 'VTVL';
export const WEBSITE_EMAIL = 'no-reply@vtvl.io';

export const MILESTONE_FACTORY_CONTRACTS: { [key: number]: string } = {
  1: '',
  5: '0x5D9FD9f8Daf37506e229A94358C39F4243Dd3481',
  137: '0xaccb39EFB73605c75470EA81B4bBC7cfB4C5F2C9', //todo
  12009: '',
  80001: '0xE8F713550e358F66d301B997A9dF6E8E430C21C6'
};

export const TIME_FACTORY_CONTRACTS: { [key: number]: string } = {
  1: '',
  5: '0xb753D2E88E617b6a188BB34Fd4af3802599e0139',
  137: '0x2814801fC51608fF6102ec03FCF0Aa0b80C1F863', // todo
  12009: '0x41d3f5e5744df065B34bc30be2021DDf8Ff72480',
  80001: '0x4E260Af441396a01243c5E6748078F89a4839f4A'
};
export const PLATFORM_NAME = 'app';

export const REDIRECT_URIS = {
  AUTH_LOGIN: encodeURI(`${PUBLIC_DOMAIN_NAME}/v2/auth/login`),
  AUTH_REGISTER: encodeURI(`${PUBLIC_DOMAIN_NAME}/v2/auth/register`),
  AUTH_EMAIL: encodeURI(`${PUBLIC_DOMAIN_NAME}/v2/auth/verify`),
  AUTH_GOOGLE_CALLBACK: encodeURI(`${PUBLIC_DOMAIN_NAME}/auth/google`),
  AUTH_GOOGLE_LOGIN: encodeURI(`${PUBLIC_DOMAIN_NAME}/v2/auth/connect`),
  INVITE_MEMBER: encodeURI(`${PUBLIC_DOMAIN_NAME}/v2/auth/verify`),
  SETUP_ACCOUNT: encodeURI(`${PUBLIC_DOMAIN_NAME}/v2/onboarding/account-setup`),
  MAIN: encodeURI(`${PUBLIC_DOMAIN_NAME}/dashboard`),
  RECIPIENT_INVITE: encodeURI(`${PUBLIC_DOMAIN_NAME}/recipient/create`),
  CLAIM: encodeURI(`${PUBLIC_DOMAIN_NAME}/claim-portal`)
};

export const TOAST_NOTIFICATION_IDS = {
  SUCCESS: 'notif-success',
  ERROR: 'notif-error',
  WARNING: 'notif-warning',
  INFO: 'notif-info',
  ANY: 'notif-any'
};

export const USE_NEW_API = process.env.NEXT_PUBLIC_ENABLE_API_INTEGRATION || false;

export const NO_CONNECT_WALLET_BUTTON_PAGES = [
  '/',
  '/v2/auth/register',
  '/v2/auth/login',
  '/v2/auth/connect',
  '/v2/auth/verify',
  '/v2/auth/google',
  '/auth/google',
  '/onboarding/connect-wallet',
  '/onboarding',
  '/404',
  '/not-found',
  '/terms',
  '/privacypolicy'
];

export const NO_CONNECT_WALLET_MODAL_PAGES = [
  ...NO_CONNECT_WALLET_BUTTON_PAGES,
  '/onboarding/sign-up',
  '/onboarding/login',
  '/onboarding/member-login',
  '/expired',
  '/recipient/schedule'
];

export const NO_SIDEBAR_PAGES = [
  '',
  '/recipient/schedule',
  '/recipient/confirm',
  '/magic-link-verification',
  '/v2/auth/login',
  '/v2/auth/register',
  '/v2/onboarding/account-setup',
  '/v2/onboarding/setup-safes'
];

export const TOAST_IDS = {
  ERROR: 'vtvl-toast-error',
  SUCCESS: 'vtvl-toast-success',
  WARNING: 'vtvl-toast-warning',
  INFO: 'vtvl-toast-info'
};

export const WALLET_CONNECT_V2_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '';
