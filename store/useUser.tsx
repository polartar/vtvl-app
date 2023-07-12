import { IRole } from 'types/models/settings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStoreState = {
  name: string;
  email: string;
  userId: string;
  organizationId: string;
  role: IRole | '';
  walletAddress: string;
  chainId: number;
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
      walletAddress: '',
      organizationId: '',
      role: '',
      chainId: 0,
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
          walletAddress: '',
          role: '',
          chainId: 0
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
  const walletAddress = useUserStore(({ walletAddress }: UserStoreState) => walletAddress);
  const chainId = useUserStore(({ chainId }: UserStoreState) => chainId);
  const role = useUserStore(({ role }: UserStoreState) => role);

  return {
    save,
    clear,
    name,
    email,
    userId,
    organizationId,
    walletAddress,
    chainId,
    role
  };
};
