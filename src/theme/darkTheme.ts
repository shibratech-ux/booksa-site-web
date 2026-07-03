import { colors } from './colors';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

export const darkTheme = {
  mode: 'dark',
  colors: {
    background: colors.dark.background,
    surface: colors.dark.surface,
    card: colors.dark.card,
    sidebar: colors.dark.sidebar,
    textPrimary: colors.dark.textPrimary,
    textSecondary: colors.dark.textSecondary,
    border: colors.dark.border,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
    gradient: colors.gradient.dark,
    chart: colors.chart
  },
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  ui: {
    button: {
      primary: 'primary-button',
      secondary: 'secondary-button',
      outline: 'outline-button',
      ghost: 'ghost-button',
      danger: 'danger-button'
    },
    card: {
      elevated: 'dashboard-card dashboard-card-elevated',
      flat: 'dashboard-card dashboard-card-flat',
      interactive: 'dashboard-card dashboard-card-interactive card-hover'
    }
  }
} as const;
