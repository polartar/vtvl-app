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
  5: '0x27D55Bb85B10326971212B773Bd55CbeAC916a59',
  137: '0xaccb39EFB73605c75470EA81B4bBC7cfB4C5F2C9',
  12009: '',
  80001: '0xeB743FB4dD1EA47e57fd1135882143AdBb8595F8'
};

export const TIME_FACTORY_CONTRACTS: { [key: number]: string } = {
  5: '0x81A0Dd5BE8392eb9862f6b3f8668F6CE065Be472',
  137: '0x56A848c78a54b8353b2Ca9Af91B5c01270912485',
  12009: '0x41d3f5e5744df065B34bc30be2021DDf8Ff72480',
  80001: '0xF409eDc80a93E96F224d615Df92F5ab3Aa8aFCfE'
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
  '/v2/onboarding/setup-safes',
  '/onboarding/new-safe',
  '/onboarding/setup-safe-success',
  '/onboarding/setup-safes'
];

export const TOAST_IDS = {
  ERROR: 'vtvl-toast-error',
  SUCCESS: 'vtvl-toast-success',
  WARNING: 'vtvl-toast-warning',
  INFO: 'vtvl-toast-info'
};

export const WALLET_CONNECT_V2_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '';
