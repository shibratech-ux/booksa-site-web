import { colors } from './colors';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

export const lightTheme = {
  mode: 'light',
  colors: {
    background: colors.light.background,
    surface: colors.light.surface,
    card: colors.light.card,
    sidebar: colors.light.sidebar,
    textPrimary: colors.light.textPrimary,
    textSecondary: colors.light.textSecondary,
    border: colors.light.border,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
    gradient: colors.gradient.light,
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
