import { colors, type ThemeMode } from './colors';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export type ThemePreference = ThemeMode;
export type ThemeName = 'light' | 'dark';
export type ThemeDefinition = typeof lightTheme | typeof darkTheme;

export const theme = {
  colors,
  themes: {
    light: lightTheme,
    dark: darkTheme
  },
  defaultMode: 'system' as ThemePreference
} as const;

export function getResolvedTheme(mode: ThemePreference, prefersDark: boolean): ThemeDefinition {
  if (mode === 'system') {
    return prefersDark ? darkTheme : lightTheme;
  }

  return mode === 'dark' ? darkTheme : lightTheme;
}
