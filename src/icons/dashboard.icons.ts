import { ChartColumn, Banknote, CreditCard, ShieldCheck, Sparkles, ChartLine } from 'lucide-react';

export const dashboardIcons = {
  revenue: Banknote,
  cards: CreditCard,
  security: ShieldCheck,
  impact: Sparkles,
  analytics: ChartColumn,
  heroAnalytics: ChartLine
} as const;
