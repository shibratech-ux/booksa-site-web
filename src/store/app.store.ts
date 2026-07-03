import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/utils/constants';
import type { ThemeMode } from '@/theme/colors';

interface AppStore {
  sidebarOpen: boolean;
  theme: ThemeMode;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      theme: 'system',
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: STORAGE_KEYS.app,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
