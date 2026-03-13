import { useState, useRef, type FormEvent } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createTransaction } from '../api';
import { CATEGORY_VALUES } from '@fmanager/common';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddTransactionModal({ onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);
    if (pdfFile) data.set('receipt', pdfFile);
    setLoading(true);
    try {
      await createTransaction(data);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addModal.errorDefault'));
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-cl-border bg-cl-surface-2 text-sm text-cl-text focus:outline-none focus:ring-2 focus:ring-cl-accent focus:border-transparent placeholder:text-cl-dim';
  const labelCls = 'block text-sm font-medium text-cl-text-2 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-cl-surface rounded-2xl shadow-2xl w-full max-w-md border border-cl-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cl-border">
          <h2 className="text-lg font-semibold text-cl-text">{t('addModal.title')}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cl-subtle hover:text-cl-muted hover:bg-cl-surface-2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={labelCls}>{t('addModal.fieldTitle')}</label>
            <input
              name="title"
              required
              placeholder={t('addModal.fieldTitlePlaceholder')}
              className={inputCls}
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('addModal.fieldAmount')}</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('addModal.fieldDate')}</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>{t('addModal.fieldCategory')}</label>
            <select name="category" defaultValue="other" className={inputCls}>
              {CATEGORY_VALUES.map(v => (
                <option key={v} value={v}>{t(`category.${v}`)}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>
              {t('addModal.fieldDescription')}{' '}
              <span className="text-cl-subtle font-normal">({t('addModal.optional')})</span>
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder={t('addModal.fieldDescriptionPlaceholder')}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* PDF Receipt */}
          <div>
            <label className={labelCls}>
              {t('addModal.fieldReceipt')}{' '}
              <span className="text-cl-subtle font-normal">({t('addModal.optional')})</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
            />
            {pdfFile ? (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-green-200 bg-green-50">
                <FileText size={16} className="text-green-600 shrink-0" />
                <span className="text-sm text-green-700 truncate flex-1">{pdfFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setPdfFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="text-green-500 hover:text-green-700"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-cl-border-md text-sm text-cl-muted hover:border-cl-accent hover:text-cl-accent hover:bg-cl-accent-bg transition-colors"
              >
                <Upload size={15} />
                {t('addModal.uploadReceipt')}
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-cl-muted bg-cl-surface-2 hover:bg-cl-surface-3 transition-colors"
            >
              {t('addModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-cl-accent hover:bg-cl-accent-h disabled:opacity-60 transition-colors"
            >
              {loading ? t('addModal.saving') : t('addModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
