import type { Transaction, Stats, Filters } from '@fmanager/common';

const BASE = '/api/transactions';

export async function fetchTransactions(filters: Partial<Filters> = {}): Promise<Transaction[]> {
  const url = new URL(BASE, window.location.origin);
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== 'all') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load transactions');
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/stats`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function createTransaction(data: FormData): Promise<Transaction> {
  const res = await fetch(BASE, { method: 'POST', body: data, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to create transaction');
  }
  return res.json();
}

export async function updateTransaction(id: number, data: FormData): Promise<Transaction> {
  const res = await fetch(`${BASE}/${id}`, { method: 'PATCH', body: data, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to update transaction');
  }
  return res.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete transaction');
}

export async function deleteReceipt(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}/receipt`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete receipt');
}

export function receiptUrl(id: number): string {
  return `${BASE}/${id}/receipt`;
}
