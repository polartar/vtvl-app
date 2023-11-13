/**
 * @note Consider i18n implementation
 */

export const ERROR_MESSAGES = {
  EN: {
    /* Auth */
    EMAIL_VERIFICATION_FAILED: 'It looks like your magic link is not valid anymore. Please try again',
    GOOGLE_LOGIN_FAILED: "Logging in with Google didn't work this time. Please try again",

    NETWORK: 'Oops! Something went wrong. Please check with VTVL administrators',

    SEND_LOGIN_EMAIL: 'Oops! Sending magic link failed. Please make sure you are registered',
    SEND_SIGN_UP_EMAIL: 'Oops! Sending magic link failed. Please check with VTVL administrators',

    WALLET_CONNECT: 'Oh no! Your wallet failed to connect with VTVL. Please try again',
    WALLET_CONNECT_USER: 'This wallet address is already registered with another user. Please connect a new wallet',

    TOKEN_EXPIRED: 'Oops! looks like your access has expired, please log in again',

    /** PROFILE */
    GET_PROFILE: 'Cannot get user profile :(',
    UPDATE_PROFILE: 'Update user profile failed!',

    /* ORGANIZATIONS */
    GET_ORGANIZATIONS: 'Cannot get organizations',
    CREATE_ORGANIZATION: 'Cannot create organization',
    GET_MEMBERS: 'Cannot get members',
    CREATE_MEMBER: 'Cannot create member',
    INVITE_MEMBER: 'Cannot invite member',

    /* SAFE */
    CREATE_SAFE: 'Cannot create safe',
    UPDATE_SAFE: 'Cannot update safe',
    GET_SAFE: 'Cannot get safe information'
    /* */
  }
} as const;

export const SUCCESS_MESSAGES = {
  EN: {
    /* Auth */
    SEND_LOGIN_EMAIL: 'Please check your email for the link to login',
    SEND_SIGN_UP_EMAIL: 'Please check your email for the link to login',
    LOGIN: 'Magic link verified! Please connect your wallet',
    WALLET_CONNECT: 'Wallet connected!',

    /* ORGANIZATIONS */
    GET_ORGANIZATIONS: 'Organizations found',
    // CREATE_ORGANIZATION: 'Organization created',
    CREATE_ORGANIZATION: 'Welcome to VTVL!',
    GET_MEMBERS: 'Members found!',
    CREATE_MEMBER: 'Member created!',

    /* SAFE */
    CREATE_SAFE: 'Safe created!',
    UPDATE_SAFE: 'Safe updated!'
    /* */
  }
} as const;
