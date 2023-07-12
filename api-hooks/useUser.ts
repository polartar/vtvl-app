import UserApiService from '@api-services/UserApiService';
import { useUser } from '@store/useUser';
import { TOAST_NOTIFICATION_IDS } from '@utils/constants';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES } from './messages';

const useUserAPI = () => {
  const { name, email, userId, save } = useUser();

  const getUserProfile = useCallback(() => {
    // Ensure that after getting the profile, update the user state with it
    return UserApiService.getProfile()
      .then((res: any) => {
        console.log('USER PROFILE DATA', res);
        save({
          userId: res.user.id,
          name: res.user.name || '',
          email: res.user.email,
          walletAddress: res.wallet.address
          // Add the chainId later when it is provided by the new API
        });
        // toast.success(SUCCESS_MESSAGES.EN.SEND_LOGIN_EMAIL);
        return res;
      })
      .catch((error: any) => {
        console.log('USER PROFILE ERROR', error);
        if (error?.code === 'ERR_NETWORK')
          toast.error(ERROR_MESSAGES.EN.NETWORK, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
        if (error?.request?.status === 400)
          toast.error(ERROR_MESSAGES.EN.SEND_LOGIN_EMAIL, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  const updateUserProfile = useCallback((payload: { name: string }) => {
    return UserApiService.updateProfile(payload)
      .then((res: any) => {
        save({ email, userId, name: payload.name });
      })
      .catch((error: any) => {
        console.log('ERROR UPDATING USER PROFILE', error);
        toast.error(ERROR_MESSAGES.EN.UPDATE_PROFILE, { toastId: TOAST_NOTIFICATION_IDS.ERROR });
      });
  }, []);

  return useMemo(
    () => ({
      getUserProfile,
      updateUserProfile
    }),
    []
  );
};

export default useUserAPI;
