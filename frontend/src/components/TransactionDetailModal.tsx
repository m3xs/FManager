import { X, FileText, ExternalLink, Trash2, Pencil, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, type FormEvent } from 'react';
import type { Transaction } from '@fmanager/common';
import { CATEGORY_STYLES, CATEGORY_VALUES, formatEur, formatDate } from '@fmanager/common';
import { receiptUrl, deleteTransaction, updateTransaction } from '../api';

interface Props {
  tx: Transaction;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

type Mode = 'view' | 'edit' | 'deleteConfirm';

export default function TransactionDetailModal({ tx, onClose, onDeleted, onUpdated }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-GB';

  const [currentTx, setCurrentTx] = useState<Transaction>(tx);
  const [mode, setMode] = useState<Mode>('view');
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const style = CATEGORY_STYLES[currentTx.category] ?? CATEGORY_STYLES.other;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(currentTx.id);
      onDeleted();
      onClose();
    } catch {
      setDeleting(false);
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = new FormData(e.currentTarget);
      if (pdfFile) data.set('receipt', pdfFile);
      if (removeReceipt) data.set('removeReceipt', 'true');
      const updated = await updateTransaction(currentTx.id, data);
      setCurrentTx(updated);
      setPdfFile(null);
      setRemoveReceipt(false);
      setMode('view');
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('detailModal.errorDefault'));
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setPdfFile(null);
    setRemoveReceipt(false);
    setError('');
    setMode('view');
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-cl-border bg-cl-surface-2 text-sm text-cl-text focus:outline-none focus:ring-2 focus:ring-cl-accent focus:border-transparent placeholder:text-cl-dim';
  const labelCls = 'block text-sm font-medium text-cl-text-2 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-cl-surface rounded-2xl shadow-2xl border border-cl-border w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-cl-border">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-cl-text truncate">{currentTx.title}</h2>
            <p className="text-sm text-cl-muted mt-0.5">{formatDate(currentTx.date, locale)}</p>
          </div>
          <button type="button" onClick={onClose} className="ml-4 p-1.5 rounded-lg text-cl-subtle hover:text-cl-muted hover:bg-cl-surface-2 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Content + Footer: form wraps both in edit mode */}
        {mode === 'edit' ? (
          <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>{t('addModal.fieldTitle')}</label>
                <input name="title" required defaultValue={currentTx.title} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('addModal.fieldAmount')}</label>
                  <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={currentTx.amount} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('addModal.fieldDate')}</label>
                  <input name="date" type="date" required defaultValue={currentTx.date} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>{t('addModal.fieldCategory')}</label>
                <select name="category" defaultValue={currentTx.category} className={inputCls}>
                  {CATEGORY_VALUES.map(v => (
                    <option key={v} value={v}>{t(`category.${v}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>{t('addModal.fieldDescription')}</label>
                <textarea name="description" rows={2} defaultValue={currentTx.description ?? ''} className={`${inputCls} resize-none`} />
              </div>

              <div>
                <label className={labelCls}>{t('addModal.fieldReceipt')}</label>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={e => { setPdfFile(e.target.files?.[0] ?? null); setRemoveReceipt(false); }}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-green-200 bg-green-50">
                    <FileText size={16} className="text-green-600 shrink-0" />
                    <span className="text-sm text-green-700 truncate flex-1">{pdfFile.name}</span>
                    <button type="button" onClick={() => { setPdfFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-green-500 hover:text-green-700">
                      <X size={14} />
                    </button>
                  </div>
                ) : currentTx.receipt_filename && !removeReceipt ? (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-cl-border bg-cl-surface-2">
                    <FileText size={16} className="text-cl-muted shrink-0" />
                    <span className="text-sm text-cl-muted truncate flex-1">{currentTx.receipt_filename}</span>
                    <button type="button" onClick={() => setRemoveReceipt(true)} className="text-red-400 hover:text-red-600 text-xs font-medium whitespace-nowrap">
                      {t('detailModal.removeReceipt')}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-cl-border-md text-sm text-cl-muted hover:border-cl-accent hover:text-cl-accent hover:bg-cl-accent-bg transition-colors">
                    <Upload size={15} />
                    {t('detailModal.uploadReceipt')}
                  </button>
                )}
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-cl-border shrink-0">
              <div className="flex gap-3">
                <button type="button" onClick={cancelEdit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-cl-muted bg-cl-surface-2 hover:bg-cl-surface-3 transition-colors">
                  {t('detailModal.cancelEdit')}
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-cl-accent hover:bg-cl-accent-h disabled:opacity-60 transition-colors">
                  {saving ? t('detailModal.saving') : t('detailModal.save')}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {mode === 'deleteConfirm' ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-cl-surface-2 rounded-xl">
                    <span className="text-sm text-cl-muted">{t('detailModal.amount')}</span>
                    <span className="text-2xl font-bold text-cl-text">{formatEur(currentTx.amount)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-cl-surface-2 rounded-xl">
                    <span className="text-sm text-cl-muted">{t('detailModal.amount')}</span>
                    <span className="text-2xl font-bold text-cl-text">{formatEur(currentTx.amount)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cl-muted">{t('detailModal.category')}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {t(`category.${currentTx.category}`)}
                    </span>
                  </div>

                  {currentTx.description && (
                    <div>
                      <p className="text-sm text-cl-muted mb-1.5">{t('detailModal.description')}</p>
                      <p className="text-sm text-cl-text-2 bg-cl-surface-2 rounded-xl px-4 py-3 leading-relaxed">{currentTx.description}</p>
                    </div>
                  )}

                  {currentTx.receipt_filename ? (
                    <div>
                      <p className="text-sm text-cl-muted mb-2">{t('detailModal.receipt')}</p>
                      <div className="rounded-xl overflow-hidden border border-cl-border">
                        <iframe src={receiptUrl(currentTx.id)} className="w-full h-72" title="Receipt PDF" />
                      </div>
                      <a href={receiptUrl(currentTx.id)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-cl-accent hover:text-cl-accent-h">
                        <ExternalLink size={13} />
                        {t('detailModal.openInNewTab')}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-cl-subtle">
                      <FileText size={15} />
                      {t('detailModal.noReceipt')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-cl-border shrink-0">
              {mode === 'view' ? (
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-cl-muted bg-cl-surface-2 hover:bg-cl-surface-3 transition-colors">
                    {t('detailModal.close')}
                  </button>
                  <button type="button" onClick={() => setMode('edit')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-cl-accent bg-cl-accent-bg hover:bg-orange-100 transition-colors">
                    <Pencil size={14} />
                    {t('detailModal.edit')}
                  </button>
                  <button type="button" onClick={() => setMode('deleteConfirm')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                    <Trash2 size={14} />
                    {t('detailModal.delete')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-cl-muted text-center">{t('detailModal.deleteConfirm')}</p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setMode('view')} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-cl-muted bg-cl-surface-2 hover:bg-cl-surface-3 transition-colors">
                      {t('detailModal.deleteCancel')}
                    </button>
                    <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors">
                      {deleting ? t('detailModal.deleting') : t('detailModal.deleteConfirmBtn')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
