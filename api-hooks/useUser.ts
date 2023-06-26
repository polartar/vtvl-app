import UserApiService from '@api-services/UserApiService';
import { useUser } from '@hooks/useUser';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { ERROR_MESSAGES } from './messages';

const useUserAPI = () => {
  const { name, email, userId, save } = useUser();

  const getUserProfile = useCallback(() => {
    return UserApiService.getProfile()
      .then((res: any) => {
        console.log('USER PROFILE DATA', res);
        save({ userId: res.user.id, name: res.user.name || '', email: res.user.email });
        // toast.success(SUCCESS_MESSAGES.EN.SEND_LOGIN_EMAIL);
      })
      .catch((error) => {
        console.log('USER PROFILE ERROR', error);
        if (error?.code === 'ERR_NETWORK') toast.error(ERROR_MESSAGES.EN.NETWORK);
        if (error?.request?.status === 400) toast.error(ERROR_MESSAGES.EN.SEND_LOGIN_EMAIL);
      });
  }, []);

  const updateUserProfile = useCallback((payload: { name: string }) => {
    return UserApiService.updateProfile(payload)
      .then((res: any) => {
        save({ email, userId, name: payload.name });
      })
      .catch((error) => {
        console.log('ERROR UPDATING USER PROFILE', error);
        toast.error(ERROR_MESSAGES.EN.UPDATE_PROFILE);
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
