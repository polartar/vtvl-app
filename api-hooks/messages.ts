/**
 * @note Consider i18n implementation
 */

export const ERROR_MESSAGES = {
  EN: {
    /* Auth */
    EMAIL_VERIFICATION_FAILED: 'Email code is not valid',
    GOOGLE_LOGIN_FAILED: 'Google auth code is not valid',

    SEND_LOGIN_EMAIL: 'Login with email has failed',
    SEND_SIGN_UP_EMAIL: 'Signup with email has failed',

    WALLET_CONNECT: 'Wallet not connected',

    /* ORGANIZATIONS */
    GET_ORGANIZATIONS: 'Cannot get organizations'
    /* */
  }
} as const;

export const SUCCESS_MESSAGES = {
  EN: {
    /* Auth */
    SEND_LOGIN_EMAIL: 'Login email is successfully sent',
    SEND_SIGN_UP_EMAIL: 'SignUp email is successfully sent',
    LOGIN: 'Logged in successfully',
    WALLET_CONNECT: 'Wallet connected',

    /* ORGANIZATIONS */
    GET_ORGANIZATIONS: 'Organizations found'
    /* */
  }
} as const;
