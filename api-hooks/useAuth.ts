import AuthApiService from '@api-services/AuthApiService';
import { useAuth as useAuthStore } from '@store/useAuth';
import { TOAST_NOTIFICATION_IDS } from '@utils/constants';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './messages';

const useAuthAPI = () => {
  const { save: saveAuth, clear: clearAuth } = useAuthStore();

  /* Email Login & Signup */

  const loginWithEmail = useCallback((payload: AuthWithEmailRequest) => {
    return AuthApiService.loginWithEmail(payload)
      .then((res) => {
        console.log('LOGIN WITH EMAIL DATA', res);
        toast.success(SUCCESS_MESSAGES.EN.SEND_LOGIN_EMAIL, { toastId: TOAST_NOTIFICATION_IDS.SUCCESS });
      })
      .catch((error) => {
        console.log('AUTH LOGIN ERROR', error);
        if (error?.code === 'ERR_NETWORK')
          toast.error(ERROR_MESSAGES.EN.NETWORK, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        if (error?.request?.status === 400)
          toast.error(ERROR_MESSAGES.EN.SEND_LOGIN_EMAIL, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  const signupWithEmail = useCallback((payload: AuthWithEmailRequest) => {
    return AuthApiService.signupWithEmail(payload)
      .then((res) => {
        console.log('SIGN UP WITH EMAIL DATA', res);
        toast.success(SUCCESS_MESSAGES.EN.SEND_SIGN_UP_EMAIL, { toastId: TOAST_NOTIFICATION_IDS.SUCCESS });
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGES.EN.SEND_SIGN_UP_EMAIL, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  const validateVerificationCode = useCallback((payload: VerifyEmailRequest) => {
    return AuthApiService.validateVerificationCode(payload)
      .then((res) => {
        console.log('VALIDATE CODE DATA', res);
        saveAuth(res);
      })
      .then(() => toast.success(SUCCESS_MESSAGES.EN.LOGIN, { toastId: TOAST_NOTIFICATION_IDS.SUCCESS }))
      .catch((error) => {
        // TODO check error code for sentry setup
        console.error('Verification code is invalid: ', error);
        toast.error(ERROR_MESSAGES.EN.EMAIL_VERIFICATION_FAILED, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  /* Google login */

  const getGoogleAuthCallback = useCallback(AuthApiService.getGoogleAuthCallback, []);

  const loginWithGoogle = useCallback((payload: GoogleAuthLoginRequest) => {
    return AuthApiService.googleAuthLogin(payload)
      .then((res) => {
        console.log('LOGIN WITH GOOGLE DATA', res);
        saveAuth(res);
      })
      .catch((error) => {
        // TODO check error code for sentry setup
        console.error('Google auth code is invalid: ', error);
        toast.error(ERROR_MESSAGES.EN.GOOGLE_LOGIN_FAILED, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  /* Log out */
  const logout = useCallback(() => {
    clearAuth();
  }, []);

  /* Connect wallet */
  const connectWallet = useCallback((payload: ConnectWalletRequest) => {
    return AuthApiService.connectWallet(payload)
      .then((res) => {
        console.log('CONNECT WALLET DATA', res);
        saveAuth(res);
      })
      .catch((error) => toast.error(ERROR_MESSAGES.EN.WALLET_CONNECT, { toastId: TOAST_NOTIFICATION_IDS.ERROR }));
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

export default useAuthAPI;
