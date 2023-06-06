import { create } from 'zustand';

const useAuthStore = create<AuthStoreState & AuthStoreActions>((set) => ({
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
}));

type AuthStoreState = {
  accessToken: string;
  refreshToken: string;
};

type AuthStoreActions = {
  save: (payload: AuthResponse) => void;
  clear: () => void;
};

export const getAuthStore = () => useAuthStore.getState();

export const useAuth = useAuthStore;
