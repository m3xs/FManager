import { TrendingDown, Receipt, Calendar, Wallet, Pencil, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Stats } from '@fmanager/common';
import { CATEGORY_STYLES, CATEGORY_VALUES, formatEur, formatMonth } from '@fmanager/common';

interface Props {
  stats: Stats;
  salary: number | null;
  onSalaryChange: (value: number | null) => void;
}

export default function StatsBar({ stats, salary, onSalaryChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-GB';
  const maxMonthTotal = Math.max(...stats.recentMonths.map(m => m.total), 1);

  const remaining = salary !== null ? salary - stats.thisMonth : null;
  const spentPct = salary && salary > 0 ? Math.min((stats.thisMonth / salary) * 100, 100) : 0;
  const isOver = salary !== null && stats.thisMonth > salary;

  function startEdit() {
    setDraft(salary !== null ? String(salary) : '');
    setEditing(true);
  }

  function commitEdit() {
    const val = parseFloat(draft.replace(',', '.'));
    if (!isNaN(val) && val >= 0) onSalaryChange(val);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  return (
    <div className="space-y-4">
      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cl-surface rounded-2xl p-5 shadow-sm border border-cl-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-cl-accent-bg rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-cl-accent" />
            </div>
            <span className="text-sm text-cl-muted font-medium">{t('stats.thisMonth')}</span>
          </div>
          <p className="text-2xl font-bold text-cl-text">{formatEur(stats.thisMonth)}</p>
          <p className="text-xs text-cl-subtle mt-1">
            {t('stats.transactions', { count: stats.thisMonthCount })}
          </p>
        </div>

        <div className="bg-cl-surface rounded-2xl p-5 shadow-sm border border-cl-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
              <TrendingDown size={18} className="text-rose-500" />
            </div>
            <span className="text-sm text-cl-muted font-medium">{t('stats.allTime')}</span>
          </div>
          <p className="text-2xl font-bold text-cl-text">{formatEur(stats.allTime)}</p>
          <p className="text-xs text-cl-subtle mt-1">{t('stats.totalSpent')}</p>
        </div>

        <div className="bg-cl-surface rounded-2xl p-5 shadow-sm border border-cl-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Receipt size={18} className="text-amber-500" />
            </div>
            <span className="text-sm text-cl-muted font-medium">{t('stats.topCategory')}</span>
          </div>
          {stats.byCategory.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-cl-text">
                {t(`category.${stats.byCategory[0].category}`)}
              </p>
              <p className="text-xs text-cl-subtle mt-1">{formatEur(stats.byCategory[0].total)}</p>
            </>
          ) : (
            <p className="text-sm text-cl-subtle">{t('stats.noData')}</p>
          )}
        </div>
      </div>

      {/* Budget / Salary card */}
      <div className="bg-cl-surface rounded-2xl p-5 shadow-sm border border-cl-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Wallet size={18} className="text-emerald-500" />
            </div>
            <span className="text-sm text-cl-muted font-medium">{t('stats.salary')}</span>
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              className="p-1.5 rounded-lg text-cl-subtle hover:text-cl-muted hover:bg-cl-surface-2 transition-colors"
              title={t('stats.setSalary')}
            >
              <Pencil size={14} />
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-cl-muted text-sm">€</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
              placeholder={t('stats.salaryPlaceholder')}
              className="flex-1 bg-cl-surface-2 border border-cl-border rounded-lg px-3 py-1.5 text-sm text-cl-text focus:outline-none focus:ring-2 focus:ring-cl-accent"
              autoFocus
            />
            <button onClick={commitEdit} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
              <Check size={15} />
            </button>
            <button onClick={cancelEdit} className="p-1.5 rounded-lg text-cl-subtle hover:bg-cl-surface-2 transition-colors">
              <X size={15} />
            </button>
          </div>
        ) : salary !== null ? (
          <>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className={`text-2xl font-bold ${isOver ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {remaining !== null ? formatEur(Math.abs(remaining)) : '—'}
                </p>
                <p className="text-xs text-cl-subtle mt-0.5">
                  {isOver ? t('stats.budgetExceeded') : t('stats.remaining')}
                  {' · '}
                  {t('stats.ofSalary', { salary: formatEur(salary) })}
                </p>
              </div>
              <span className="text-sm font-medium text-cl-muted">{Math.round(spentPct)}%</span>
            </div>
            <div className="h-2 bg-cl-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
          </>
        ) : (
          <button
            onClick={startEdit}
            className="text-sm text-cl-accent hover:underline"
          >
            {t('stats.setSalary')} →
          </button>
        )}
      </div>

      {/* Category breakdown */}
      {stats.byCategory.length > 0 && (
        <div className="bg-cl-surface rounded-2xl p-5 shadow-sm border border-cl-border">
          <h3 className="text-sm font-semibold text-cl-muted mb-4">{t('stats.spendingByCategory')}</h3>
          <div className="space-y-3">
            {CATEGORY_VALUES.filter(cat => stats.byCategory.some(b => b.category === cat)).map(cat => {
              const item = stats.byCategory.find(b => b.category === cat)!;
              const style = CATEGORY_STYLES[cat];
              const pct = stats.thisMonth > 0 ? (item.total / stats.thisMonth) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      <span className="text-sm text-cl-text-2">{t(`category.${cat}`)}</span>
                      <span className="text-xs text-cl-subtle">({item.count})</span>
                    </div>
                    <span className="text-sm font-medium text-cl-text-2">{formatEur(item.total)}</span>
                  </div>
                  <div className="h-1.5 bg-cl-surface-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${style.dot} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent months mini chart */}
      {stats.recentMonths.length > 1 && (
        <div className="bg-cl-surface rounded-2xl p-5 shadow-sm border border-cl-border">
          <h3 className="text-sm font-semibold text-cl-muted mb-4">
            {t('stats.lastMonths', { count: stats.recentMonths.length })}
          </h3>
          <div className="flex items-end gap-2 h-20">
            {[...stats.recentMonths].reverse().map(m => {
              const barH = Math.max((m.total / maxMonthTotal) * 100, 4);
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1.5"
                  title={`${formatMonth(m.month, locale)}: ${formatEur(m.total)}`}
                >
                  <div
                    className="w-full bg-cl-accent rounded-t-md transition-all duration-500 hover:bg-cl-accent-h"
                    style={{ height: `${barH}%` }}
                  />
                  <span className="text-[10px] text-cl-subtle whitespace-nowrap">
                    {formatMonth(m.month, locale).split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
