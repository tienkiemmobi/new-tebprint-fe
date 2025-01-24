import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { MeDto } from '@/interfaces';

type AuthStore = {
  isLoggedIn: boolean;
  bearerToken: string;
  storeCode: string;
  user: MeDto | null;
  login: (bearerToken: string, user: MeDto) => void;
  logout: () => void;
  setUser: (user: MeDto) => void;
  setStoreCode: (storeCode: string) => void;
};

export const useAuthStore = createStore<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      bearerToken: '',
      user: null,
      storeCode: '',
      login: (bearerToken: string, user) => set({ isLoggedIn: true, bearerToken, user }),
      logout: () => set({ isLoggedIn: false, bearerToken: '', user: null }),
      setUser: (user) => set({ user }),
      setStoreCode: (storeCode: string) => set({ storeCode }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
