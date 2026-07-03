import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, AuthUser } from '@/types/auth.types';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser, token: string) => void;
  clearUser: () => void;
  setStatus: (status: AuthState['status']) => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'anonymous'
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          status: 'authenticated'
        }),
      clearUser: () => set({ ...initialState }),
      setStatus: (status) => set({ status })
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        status: state.status
      })
    }
  )
);
