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
    50: '#fff1f5',
    100: '#ffe4ec',
    200: '#ffc9da',
    300: '#ff9abb',
    400: '#f66795',
    500: '#e00b55',
    600: '#ce1052',
    700: '#ad1048',
    800: '#8f123f',
    900: '#761538'
  },
  secondary: '#e00b55',
  success: '#008A05',
  warning: '#F59E0B',
  danger: '#C13515',
  info: '#0EA5E9',
  gradient: {
    light: {
      topLeft: 'rgba(233, 20, 95, 0.10)',
      topRight: 'rgba(233, 20, 95, 0.06)',
      base: '#FFFFFF'
    },
    dark: {
      topLeft: 'rgba(233, 20, 95, 0.16)',
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
    blue: ['#e00b55', '#5B8CFF', '#e00b55', '#f66795', '#8AB4FF'],
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
