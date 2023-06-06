import { useAuth as useAuthStore } from '@hooks/useAuth';
import AuthApiService from 'api-services/AuthApiService';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './messages';

const useAuth = () => {
  const { save: saveAuth, clear: clearAuth } = useAuthStore();

  /* Email Login & Signup */

  const loginWithEmail = useCallback((payload: AuthWithEmailRequest) => {
    return AuthApiService.loginWithEmail(payload)
      .then(() => toast.success(SUCCESS_MESSAGES.EN.SEND_LOGIN_EMAIL))
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.SEND_LOGIN_EMAIL);
      });
  }, []);

  const signupWithEmail = useCallback((payload: AuthWithEmailRequest) => {
    return AuthApiService.signupWithEmail(payload)
      .then(() => toast.success(SUCCESS_MESSAGES.EN.SEND_SIGN_UP_EMAIL))
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.SEND_SIGN_UP_EMAIL);
      });
  }, []);

  const validateVerificationCode = useCallback((payload: VerifyEmailRequest) => {
    return AuthApiService.validateVerificationCode(payload)
      .then(saveAuth)
      .then(() => toast.success(SUCCESS_MESSAGES.EN.LOGIN))
      .catch((error) => {
        // TODO check error code for sentry setup
        console.error('Verification code is invalid: ', error);
        toast.error(ERROR_MESSAGES.EN.EMAIL_VERIFICATION_FAILED);
      });
  }, []);

  /* Google login */

  const getGoogleAuthCallback = useCallback(AuthApiService.getGoogleAuthCallback, []);

  const loginWithGoogle = useCallback((payload: GoogleAuthLoginRequest) => {
    return AuthApiService.googleAuthLogin(payload)
      .then(saveAuth)
      .catch((error) => {
        // TODO check error code for sentry setup
        console.error('Google auth code is invalid: ', error);
        toast.error(ERROR_MESSAGES.EN.GOOGLE_LOGIN_FAILED);
      });
  }, []);

  /* Log out */
  const logout = useCallback(() => {
    clearAuth();
  }, []);

  /* Connect wallet */
  const connectWallet = useCallback((payload: ConnectWalletRequest) => {
    return AuthApiService.connectWallet(payload)
      .then(saveAuth)
      .catch((error) => toast.error(ERROR_MESSAGES.EN.WALLET_CONNECT));
  }, []);

  return useMemo(
    () => ({
      loginWithEmail,
      signupWithEmail,
      validateVerificationCode,
      getGoogleAuthCallback,
      loginWithGoogle,
      logout,
      connectWallet
    }),
    []
  );
};

export default useAuth;
