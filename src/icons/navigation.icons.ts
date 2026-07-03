import {
  PanelLeftRegular,
  PersonRegular,
  ReceiptRegular,
  ChartMultipleRegular,
  SettingsRegular,
  SignOutRegular,
  AlertRegular,
  SearchRegular,
  DismissRegular,
  HomeRegular
} from '@fluentui/react-icons';

export const navigationIcons = {
  dashboard: HomeRegular,
  users: PersonRegular,
  transactions: ReceiptRegular,
  reports: ChartMultipleRegular,
  settings: SettingsRegular,
  logout: SignOutRegular,
  menu: PanelLeftRegular,
  search: SearchRegular,
  notifications: AlertRegular,
  close: DismissRegular
} as const;
