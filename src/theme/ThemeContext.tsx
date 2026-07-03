import { createContext } from 'react';
import type { ReactNode } from 'react';
import type { ThemePreference, ThemeDefinition } from './theme';

export interface ThemeContextValue {
  mode: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  theme: ThemeDefinition;
  setMode: (mode: ThemePreference) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemePreference;
}
