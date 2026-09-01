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

  const [prefersDark, setPrefersDark] = useState(getSystemPreference);
  const resolvedTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  const theme = useMemo(() => getResolvedTheme(mode, prefersDark), [mode, prefersDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
    root.style.setProperty('--theme-gradient-top-left', theme.colors.gradient.topLeft);
    root.style.setProperty('--theme-gradient-top-right', theme.colors.gradient.topRight);
    root.style.setProperty('--theme-gradient-base', theme.colors.gradient.base);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-card', theme.colors.card);
    root.style.setProperty('--color-sidebar', theme.colors.sidebar);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-subtle', theme.colors.borderSubtle);
    root.style.setProperty('--color-surface-muted', theme.colors.surfaceMuted);
    root.style.setProperty('--color-surface-raised', theme.colors.surfaceRaised);
    root.style.setProperty('--color-primary-50', theme.colors.primary[50]);
    root.style.setProperty('--color-primary-100', theme.colors.primary[100]);
    root.style.setProperty('--color-primary-500', theme.colors.primary[500]);
    root.style.setProperty('--color-primary-600', theme.colors.primary[600]);
    root.style.setProperty('--color-primary-700', theme.colors.primary[700]);
    root.style.setProperty('--color-danger', theme.colors.danger);
    root.style.setProperty('--color-project-shell', theme.colors.background);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, resolvedTheme, theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => setPrefersDark(event.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

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
