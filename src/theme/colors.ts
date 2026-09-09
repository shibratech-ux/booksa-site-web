export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ThemeColorTokens {
  primary: ColorScale;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  gradient: {
    light: {
      topLeft: string;
      topRight: string;
      base: string;
    };
    dark: {
      topLeft: string;
      topRight: string;
      base: string;
    };
  };
  light: {
    background: string;
    surface: string;
    card: string;
    sidebar: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    borderSubtle: string;
    surfaceMuted: string;
    surfaceRaised: string;
  };
  dark: {
    background: string;
    surface: string;
    card: string;
    sidebar: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    borderSubtle: string;
    surfaceMuted: string;
    surfaceRaised: string;
  };
  chart: {
    blue: string[];
    green: string[];
    amber: string[];
    red: string[];
  };
  enterprise: {
    white: string;
    black: string;
    overlay: string;
  };
}

export const colors: ThemeColorTokens = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554'
  },
  secondary: '#2563eb',
  success: '#008A05',
  warning: '#F59E0B',
  danger: '#C13515',
  info: '#0EA5E9',
  gradient: {
    light: {
      topLeft: 'rgba(37, 99, 235, 0.10)',
      topRight: 'rgba(37, 99, 235, 0.06)',
      base: '#FFFFFF'
    },
    dark: {
      topLeft: 'rgba(37, 99, 235, 0.16)',
      topRight: 'rgba(12, 170, 220, 0.10)',
      base: '#0F172A'
    }
  },
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    sidebar: '#FFFFFF',
    textPrimary: '#222222',
    textSecondary: '#717171',
    border: '#DDDDDD',
    borderSubtle: '#EBEBEB',
    surfaceMuted: '#F7F7F7',
    surfaceRaised: '#FFFFFF'
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#1E293B',
    sidebar: '#111827',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#334155',
    borderSubtle: '#27364A',
    surfaceMuted: '#172033',
    surfaceRaised: '#253349'
  },
  chart: {
    blue: ['#2563EB', '#5B8CFF', '#1D4ED8', '#60A5FA', '#8AB4FF'],
    green: ['#DCFCE7', '#86EFAC', '#4ADE80', '#22C55E', '#15803D'],
    amber: ['#FEF3C7', '#FDE68A', '#FCD34D', '#F59E0B', '#B45309'],
    red: ['#FEE2E2', '#FCA5A5', '#F87171', '#C13515', '#B91C1C']
  },
  enterprise: {
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(2, 6, 23, 0.72)'
  }
};
