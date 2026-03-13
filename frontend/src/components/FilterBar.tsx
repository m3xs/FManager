import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Filters } from '@fmanager/common';
import { CATEGORY_VALUES } from '@fmanager/common';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const { t } = useTranslation();

  function set(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function reset() {
    onChange({ category: 'all', from: '', to: '', search: '' });
  }

  const hasFilters = filters.category !== 'all' || filters.from || filters.to || filters.search;

  const allCategories = [
    { value: 'all', label: t('category.all') },
    ...CATEGORY_VALUES.map(v => ({ value: v, label: t(`category.${v}`) })),
  ];

  return (
    <div className="bg-cl-surface rounded-2xl px-5 py-4 shadow-sm border border-cl-border space-y-3">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map(c => (
          <button
            key={c.value}
            onClick={() => set('category', c.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.category === c.value
                ? 'bg-cl-accent text-white shadow-sm'
                : 'bg-cl-surface-2 text-cl-muted hover:bg-cl-surface-3'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Date range + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cl-dim pointer-events-none" />
            <input
              value={filters.search}
              onChange={e => set('search', e.target.value)}
              placeholder={t('filters.search')}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-cl-border bg-cl-surface-2 text-sm text-cl-text focus:outline-none focus:ring-2 focus:ring-cl-accent focus:border-transparent placeholder:text-cl-dim"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.from}
            onChange={e => set('from', e.target.value)}
            className="px-3 py-2 rounded-xl border border-cl-border bg-cl-surface-2 text-sm text-cl-muted focus:outline-none focus:ring-2 focus:ring-cl-accent focus:border-transparent"
          />
          <span className="text-cl-dim text-sm">–</span>
          <input
            type="date"
            value={filters.to}
            onChange={e => set('to', e.target.value)}
            className="px-3 py-2 rounded-xl border border-cl-border bg-cl-surface-2 text-sm text-cl-muted focus:outline-none focus:ring-2 focus:ring-cl-accent focus:border-transparent"
          />
        </div>

        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cl-muted hover:text-cl-text-2 hover:bg-cl-surface-2 transition-colors"
          >
            <X size={13} />
            {t('filters.clear')}
          </button>
        )}
      </div>
    </div>
  );
}
