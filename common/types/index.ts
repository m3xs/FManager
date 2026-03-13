export type Category = 'rent' | 'groceries' | 'transport' | 'entertainment' | 'other';

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: Category;
  description?: string;
  date: string;
  receipt_filename?: string;
  created_at: string;
}

export interface Stats {
  thisMonth: number;
  thisMonthCount: number;
  allTime: number;
  byCategory: { category: Category; total: number; count: number }[];
  recentMonths: { month: string; total: number; count: number }[];
}

export interface Filters {
  category: string;
  from: string;
  to: string;
  search: string;
}
