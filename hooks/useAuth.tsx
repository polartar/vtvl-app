import { ERROR_MESSAGES } from '@api-hooks/messages';
import useUserAPI from '@api-hooks/useUser';
import { REDIRECT_URIS } from '@utils/constants';
import { platformRoutes } from '@utils/routes';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist<AuthStoreState & AuthStoreActions>(
    (set) => ({
      accessToken: '',
      refreshToken: '',
      save: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken
        }),
      clear: () =>
        set({
          accessToken: '',
          refreshToken: ''
        }),

      userId: '',
      saveUser: (userId: string) => set({ userId })
    }),
    { name: 'vtvl-auth' }
  )
);

type AuthStoreState = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

type AuthStoreActions = {
  saveUser: (userId: string) => void;
  save: (payload: AuthResponse) => void;
  clear: () => void;
};

export const getAuthStore = () => useAuthStore.getState();

export const useAuth = () => {
  const save = useAuthStore(({ save }: AuthStoreActions) => save);
  const saveUser = useAuthStore(({ saveUser }: AuthStoreActions) => saveUser);
  const clear = useAuthStore(({ clear }: AuthStoreActions) => clear);
  const accessToken = useAuthStore(({ accessToken }: AuthStoreState) => accessToken);
  const refreshToken = useAuthStore(({ refreshToken }: AuthStoreState) => refreshToken);
  const userId = useAuthStore(({ userId }: AuthStoreState) => userId);

  const { getUserProfile } = useUserAPI();
  const router = useRouter();

  // Check for access token validity
  // Serves as the AUTH and ROLE Guard
  const checkAccessTokenValidity = async () => {
    try {
      const currentRouteIsProtected = platformRoutes.find((r) => r.path === router.pathname);
      if (accessToken) {
        const userProfile = await getUserProfile();
        if (userProfile) {
          console.log('ACCESS TOKEN STILL VALID', userProfile);
          router.push(REDIRECT_URIS.MAIN);
        } else throw userProfile;
      } else if (currentRouteIsProtected) throw 'Deny access';
    } catch (error) {
      console.log('ACCESS TOKEN NOT VALID', error);
      toast.error(ERROR_MESSAGES.EN.TOKEN_EXPIRED);
      router.push(REDIRECT_URIS.AUTH_LOGIN);
    }
  };

  return {
    save,
    clear,
    accessToken,
    refreshToken,
    userId,
    saveUser,
    checkAccessTokenValidity
  };
};