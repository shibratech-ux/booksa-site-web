import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { getResolvedTheme, type ThemePreference } from './theme';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

const STORAGE_KEY = 'enterprise-theme-mode';

function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children, defaultMode = 'system' }: { children: ReactNode; defaultMode?: ThemePreference }) {
  const [mode, setMode] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return defaultMode;
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    return stored ?? defaultMode;
  });

  const prefersDark = getSystemPreference();
  const resolvedTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  const theme = useMemo(() => getResolvedTheme(mode, prefersDark), [mode, prefersDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
    root.style.setProperty('--theme-gradient-top-left', theme.colors.gradient.topLeft);
    root.style.setProperty('--theme-gradient-top-right', theme.colors.gradient.topRight);
    root.style.setProperty('--theme-gradient-base', theme.colors.gradient.base);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, resolvedTheme]);

  useEffect(() => {
    if (mode !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
      document.documentElement.style.colorScheme = media.matches ? 'dark' : 'light';
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      theme,
      setMode,
      toggleTheme: () => setMode(resolvedTheme === 'dark' ? 'light' : 'dark')
    }),
    [mode, resolvedTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
