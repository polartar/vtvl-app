import { IRecipientType } from 'types/models/recipient';

// Function ABIs
export const REVOKE_CLAIM_FUNCTION_ABI = 'function revokeClaim(address _recipient)';
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

declare global {
  type IRecipientTypeValue = typeof RECIPIENTS_VALUES[number];
}

export const CACHE_KEY = 'vtvl_cache';
