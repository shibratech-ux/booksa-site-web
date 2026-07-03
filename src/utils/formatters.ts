import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(value: string | Date, format = 'MMM D, YYYY'): string {
  return dayjs(value).format(format);
}

export function formatRelativeTime(value: string | Date): string {
  return dayjs(value).fromNow();
}
