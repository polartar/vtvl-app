import { IRecipientType } from 'types/models/recipient';

function parseBoolean(envValue: string | undefined, defaultValue = 'false') {
  return Boolean(JSON.parse(envValue ?? defaultValue));
}

// Function ABIs
export const REVOKE_CLAIM_FUNCTION_ABI = 'function revokeClaim(address _recipient)';
export const CREATE_VESTING_CONTRACT_ABI = 'function createVestingContract(address _tokenAddress)';
export const INVITEE_EXPIRED_TIME = Number(process.env.NEXT_PUBLIC_INVITEE_EXPIRED_TIME) || 3600 * 6; // 6 hours
// Uses the declared NEXT_PUBLIC_DOMAIN_NAME for develop, staging, production
// and uses the VERCEL_URL for vercel previews to make vercel deployments testable
export const PUBLIC_DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME ?? 'https://' + process.env.VERCEL_URL;

export const RECIPIENTS_TYPES = [
  { label: 'Advisor', value: 'advisor' },
  { label: 'Founder', value: 'founder' },
  { label: 'Investor', value: 'investor' },
  { label: 'Employee', value: 'employee' }
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

export const FACTORY_CONTRACTS: { [key: number]: string } = {
  5: '0x48CC6FFb03B14Cbf6315e99c8bfa42642848d7AA',
  12009: '0xF4c7E49ebc9B6Cb38711BA977Ca9478ba1d59dA1',
  7701: '0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A'
};
