import {
  ChartMultipleRegular,
  MoneyRegular,
  CardUiRegular,
  ShieldCheckmarkRegular,
  SparkleRegular,
  ChartPersonRegular
} from '@fluentui/react-icons';

export const dashboardIcons = {
  revenue: MoneyRegular,
  cards: CardUiRegular,
  security: ShieldCheckmarkRegular,
  impact: SparkleRegular,
  analytics: ChartMultipleRegular,
  heroAnalytics: ChartPersonRegular
} as const;
