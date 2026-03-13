import { FileText, ChevronRight, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '@fmanager/common';
import { CATEGORY_STYLES, formatEur, formatDate } from '@fmanager/common';

interface Props {
  transactions: Transaction[];
  onSelect: (tx: Transaction) => void;
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const list = map.get(tx.date) ?? [];
    list.push(tx);
    map.set(tx.date, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function TransactionList({ transactions, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-GB';

  if (transactions.length === 0) {
    return (
      <div className="bg-cl-surface rounded-2xl shadow-sm border border-cl-border px-6 py-16 text-center">
        <div className="w-14 h-14 bg-cl-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Receipt size={24} className="text-cl-dim" />
        </div>
        <p className="text-cl-text-2 font-medium">{t('list.empty')}</p>
        <p className="text-sm text-cl-subtle mt-1">{t('list.emptyHint')}</p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="space-y-5">
      {groups.map(([date, txs]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-cl-subtle uppercase tracking-wider mb-2 px-1">
            {formatDate(date, locale)}
          </p>
          <div className="bg-cl-surface rounded-2xl shadow-sm border border-cl-border divide-y divide-cl-border overflow-hidden">
            {txs.map(tx => {
              const style = CATEGORY_STYLES[tx.category] ?? CATEGORY_STYLES.other;
              return (
                <button
                  key={tx.id}
                  onClick={() => onSelect(tx)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-cl-surface-2 transition-colors text-left group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-cl-text truncate">{tx.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium ${style.text}`}>{t(`category.${tx.category}`)}</span>
                      {tx.description && (
                        <span className="text-xs text-cl-subtle truncate max-w-40">{tx.description}</span>
                      )}
                    </div>
                  </div>

                  {tx.receipt_filename && (
                    <FileText size={14} className="text-cl-dim shrink-0" />
                  )}

                  <p className="text-sm font-bold text-cl-text shrink-0">{formatEur(tx.amount)}</p>

                  <ChevronRight size={16} className="text-cl-dim shrink-0 group-hover:text-cl-subtle transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
