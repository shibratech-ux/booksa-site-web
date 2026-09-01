import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, AuthUser } from '@/types/auth.types';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthStore extends AuthState {
  lastUser: AuthUser | null;
  setUser: (user: AuthUser, token: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
  forgetLastUser: () => void;
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
      lastUser: null,
      setUser: (user, token) =>
        set({
          user,
          lastUser: user,
          token,
          isAuthenticated: true,
          status: 'authenticated'
        }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
      setToken: (token) => set({ token }),
      clearUser: () => set({ ...initialState }),
      forgetLastUser: () => set({ lastUser: null }),
      setStatus: (status) => set({ status })
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthStore>;

        return {
          ...currentState,
          ...persisted,
          lastUser: persisted.lastUser ?? persisted.user ?? null
        };
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        status: state.status,
        lastUser: state.lastUser
      })
    }
  )
);
