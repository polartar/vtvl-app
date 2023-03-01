// Function ABIs
export const REVOKE_CLAIM_FUNCTION_ABI = 'function revokeClaim(address _recipient)';
export const INVITEE_EXPIRED_TIME = Number(process.env.NEXT_PUBLIC_INVITEE_EXPIRED_TIME) || 3600 * 6; // 6 hours
