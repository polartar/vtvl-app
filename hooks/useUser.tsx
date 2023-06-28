import { IRole } from 'types/models/settings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStoreState = {
  name: string;
  email: string;
  userId: string;
  organizationId: string;
  role: IRole | '';
};

type UserStoreActions = {
  save: (payload: Partial<UserStoreState>) => void;
  clear: () => void;
};

const useUserStore = create(
  persist<UserStoreState & UserStoreActions>(
    (set) => ({
      name: '',
      email: '',
      userId: '',
      organizationId: '',
      role: '',
      save: (payload: Partial<UserStoreState>) =>
        set((state: UserStoreState) => ({
          ...state,
          ...payload
        })),
      clear: () =>
        set({
          name: '',
          email: '',
          userId: '',
          organizationId: '',
          role: ''
        })
    }),
    { name: 'vtvl-user' }
  )
);

export const getUserStore = () => useUserStore.getState();

export const useUser = () => {
  const save = useUserStore(({ save }: UserStoreActions) => save);
  const clear = useUserStore(({ clear }: UserStoreActions) => clear);
  const name = useUserStore(({ name }: UserStoreState) => name);
  const email = useUserStore(({ email }: UserStoreState) => email);
  const userId = useUserStore(({ userId }: UserStoreState) => userId);
  const organizationId = useUserStore(({ organizationId }: UserStoreState) => organizationId);
  const role = useUserStore(({ role }: UserStoreState) => role);

  return {
    save,
    clear,
    name,
    email,
    userId,
    organizationId,
    role
  };
};
