import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStoreState = {
  name: string;
  email: string;
  userId: string;
};

type UserStoreActions = {
  save: (payload: UserStoreState) => void;
  clear: () => void;
};

const useUserStore = create(
  persist<UserStoreState & UserStoreActions>(
    (set) => ({
      name: '',
      email: '',
      userId: '',
      save: ({ name, email, userId }) => set({ name, email, userId }),
      clear: () =>
        set({
          name: '',
          email: '',
          userId: ''
        })
    }),
    { name: 'vtvl-user' }
  )
);

export const getUserStore = () => useUserStore.getState();

export const useUser = () => {
  const save = useUserStore(({ save }) => save);
  const clear = useUserStore(({ clear }) => clear);
  const name = useUserStore(({ name }) => name);
  const email = useUserStore(({ email }) => email);
  const userId = useUserStore(({ userId }) => userId);

  return {
    save,
    clear,
    name,
    email,
    userId
  };
};
