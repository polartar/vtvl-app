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
  const save = useAuthStore(({ save }) => save);
  const clear = useAuthStore(({ clear }) => clear);
  const accessToken = useAuthStore(({ accessToken }) => accessToken);
  const refreshToken = useAuthStore(({ refreshToken }) => refreshToken);
  const userId = useAuthStore(({ userId }) => userId);
  const saveUser = useAuthStore(({ saveUser }) => saveUser);
  return {
    save,
    clear,
    accessToken,
    refreshToken,
    userId,
    saveUser
  };
};
