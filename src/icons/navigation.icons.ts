import {
  PanelLeft,
  User,
  Receipt,
  ChartColumn,
  Settings,
  LogOut,
  Bell,
  Search,
  X,
  House
} from 'lucide-react';

export const navigationIcons = {
  dashboard: House,
  users: User,
  transactions: Receipt,
  reports: ChartColumn,
  settings: Settings,
  logout: LogOut,
  menu: PanelLeft,
  search: Search,
  notifications: Bell,
  close: X
} as const;
