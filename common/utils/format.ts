import type { Category } from '../types';

// Values only — labels are translated via t(`category.${value}`)
export const CATEGORY_VALUES: Category[] = ['rent', 'groceries', 'transport', 'entertainment', 'other'];

export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; dot: string }> = {
  rent:          { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  groceries:     { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  transport:     { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  entertainment: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  other:         { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
};

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(monthStr: string, locale: string): string {
  const [year, month] = monthStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(locale, {
    month: 'short',
    year: 'numeric',
  });
}
