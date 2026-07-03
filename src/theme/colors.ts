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
  };
  dark: {
    background: string;
    surface: string;
    card: string;
    sidebar: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
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
    50: '#EBEEFF',
    100: '#D7DEFF',
    200: '#B0BCFF',
    300: '#899BFF',
    400: '#6179FF',
    500: '#385CFF',
    600: '#2E4ADC',
    700: '#2440B8',
    800: '#1B2F8F',
    900: '#122064'
  },
  secondary: '#3A5BFF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
  gradient: {
    light: {
      topLeft: 'rgba(56, 92, 255, 0.10)',
      topRight: 'rgba(56, 92, 255, 0.06)',
      base: '#F8FAFC'
    },
    dark: {
      topLeft: 'rgba(56, 92, 255, 0.16)',
      topRight: 'rgba(12, 170, 220, 0.10)',
      base: '#0F172A'
    }
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    sidebar: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0'
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#1E293B',
    sidebar: '#111827',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#334155'
  },
  chart: {
    blue: ['#385CFF', '#5B8CFF', '#3A5BFF', '#6179FF', '#8AB4FF'],
    green: ['#DCFCE7', '#86EFAC', '#4ADE80', '#22C55E', '#15803D'],
    amber: ['#FEF3C7', '#FDE68A', '#FCD34D', '#F59E0B', '#B45309'],
    red: ['#FEE2E2', '#FCA5A5', '#F87171', '#EF4444', '#B91C1C']
  },
  enterprise: {
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(2, 6, 23, 0.72)'
  }
};
