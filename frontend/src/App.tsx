import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Transaction, Stats, Filters } from '@fmanager/common';
import { fetchTransactions, fetchStats } from './api';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionDetailModal from './components/TransactionDetailModal';

const DEFAULT_FILTERS: Filters = { category: 'all', from: '', to: '', search: '' };

export default function App() {
  const { t, i18n } = useTranslation();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [txs, st] = await Promise.all([fetchTransactions(filters), fetchStats()]);
      setTransactions(txs);
      setStats(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  function toggleLang() {
    i18n.changeLanguage(i18n.resolvedLanguage === 'de' ? 'en' : 'de');
  }

  return (
    <div className="min-h-screen bg-cl-bg">
      {/* Header */}
      <header className="bg-cl-surface border-b border-cl-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cl-accent rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">FM</span>
            </div>
            <span className="text-lg font-bold text-cl-text">FManager</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cl-muted hover:text-cl-text-2 hover:bg-cl-surface-2 transition-colors border border-cl-border"
              title="Switch language"
            >
              {i18n.resolvedLanguage === 'de' ? 'EN' : 'DE'}
            </button>

            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-xl text-cl-subtle hover:text-cl-muted hover:bg-cl-surface-2 transition-colors disabled:opacity-40"
              title={t('header.refresh')}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cl-accent text-white text-sm font-medium rounded-xl hover:bg-cl-accent-h transition-colors shadow-sm"
            >
              <Plus size={16} />
              {t('header.addTransaction')}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
            {error} — <button onClick={load} className="underline hover:no-underline">{t('error.retry')}</button>
          </div>
        )}

        {stats && <StatsBar stats={stats} />}

        <FilterBar filters={filters} onChange={setFilters} />

        {loading && !transactions.length ? (
          <div className="bg-cl-surface rounded-2xl shadow-sm border border-cl-border px-6 py-12 text-center">
            <div className="w-8 h-8 border-2 border-cl-accent-mid border-t-cl-accent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-cl-subtle mt-3">{t('loading')}</p>
          </div>
        ) : (
          <TransactionList transactions={transactions} onSelect={setSelected} />
        )}
      </main>

      {showAdd && (
        <AddTransactionModal onClose={() => setShowAdd(false)} onCreated={load} />
      )}
      {selected && (
        <TransactionDetailModal tx={selected} onClose={() => setSelected(null)} onDeleted={load} onUpdated={load} />
      )}
    </div>
  );
}
