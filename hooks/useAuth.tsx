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
        })
    }),
    { name: 'vtvl-auth' }
  )
);

type AuthStoreState = {
  accessToken: string;
  refreshToken: string;
};

type AuthStoreActions = {
  save: (payload: AuthResponse) => void;
  clear: () => void;
};

export const getAuthStore = () => useAuthStore.getState();

export const useAuth = () => {
  const save = useAuthStore(({ save }) => save);
  const clear = useAuthStore(({ clear }) => clear);
  const accessToken = useAuthStore(({ accessToken }) => accessToken);
  const refreshToken = useAuthStore(({ refreshToken }) => refreshToken);

  return {
    save,
    clear,
    accessToken,
    refreshToken
  };
};
