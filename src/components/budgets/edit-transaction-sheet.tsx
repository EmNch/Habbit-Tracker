'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateTransaction, deleteTransaction } from '@/lib/actions/budgets';
import type { BudgetCategory, BudgetCategoryKind, TransactionWithCategory } from '@/lib/types';

interface EditTransactionSheetProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionWithCategory;
  categories: BudgetCategory[];
}

export function EditTransactionSheet({ open, onClose, transaction, categories }: EditTransactionSheetProps) {
  const [kind, setKind] = useState<BudgetCategoryKind>(transaction.kind);
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [displayAmount, setDisplayAmount] = useState(
    (transaction.amount_cents / 100).toFixed(2).replace(/\.?0+$/, '') || '0',
  );
  const [note, setNote] = useState(transaction.note || '');
  const [date, setDate] = useState(transaction.transaction_date);
  const [saving, setSaving] = useState(false);

  const filtered = categories.filter((c) => c.kind === kind);

  useEffect(() => {
    setKind(transaction.kind);
    setCategoryId(transaction.category_id);
    setDisplayAmount((transaction.amount_cents / 100).toFixed(2).replace(/\.?0+$/, '') || '0');
    setNote(transaction.note || '');
    setDate(transaction.transaction_date);
    setSaving(false);
  }, [transaction]);

  function handleKey(val: string) {
    if (val === 'backspace') {
      setDisplayAmount((prev) => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }
    if (val === '.') {
      if (displayAmount.includes('.')) return;
      setDisplayAmount((prev) => prev + '.');
      return;
    }
    if (val === '00') {
      if (displayAmount === '0') return;
      const parts = displayAmount.split('.');
      if (parts.length === 2 && parts[1].length >= 1) return;
      setDisplayAmount((prev) => prev + '00');
      return;
    }
    if (displayAmount === '0' && val !== '.') {
      setDisplayAmount(val);
      return;
    }
    const parts = displayAmount.split('.');
    if (parts.length === 2 && parts[1].length >= 2) return;
    setDisplayAmount((prev) => prev + val);
  }

  async function handleSave() {
    const cents = Math.round(parseFloat(displayAmount) * 100);
    if (!categoryId || cents <= 0) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('category_id', categoryId);
    formData.append('amount_cents', String(cents));
    formData.append('kind', kind);
    formData.append('note', note);
    formData.append('transaction_date', date);

    try {
      await updateTransaction(transaction.id, formData);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const amountCents = Math.round(parseFloat(displayAmount) * 100) || 0;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="px-5 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Editează tranzacție
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Kind toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setKind('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                kind === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Cheltuială
            </button>
            <button
              onClick={() => setKind('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                kind === 'income'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Venit
            </button>
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Categorie
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition flex-shrink-0 ${
                    categoryId === cat.id
                      ? 'ring-2 ring-offset-1 bg-gray-50 dark:bg-gray-700'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  style={categoryId === cat.id ? { '--tw-ring-color': cat.color } as React.CSSProperties : {}}
                >
                  <span>{cat.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount display */}
          <div className="text-center py-2">
            <p className={`text-4xl font-bold tabular-nums ${
              kind === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {kind === 'expense' ? '-' : '+'}{displayAmount}
            </p>
            <p className="text-xs text-gray-400 mt-1">RON</p>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3', 'backspace', '4', '5', '6', '00', '7', '8', '9', '.', '0', '000'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKey(key)}
                className={`py-3 rounded-lg text-lg font-medium transition ${
                  key === 'backspace'
                    ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500'
                } ${key === '0' ? 'col-span-2' : ''}`}
              >
                {key === 'backspace' ? '⌫' : key}
              </button>
            ))}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dată</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Note */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notă (opțional)"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition disabled:opacity-40"
            >
              Șterge
            </button>
            <button
              onClick={handleSave}
              disabled={saving || amountCents === 0 || !categoryId}
              className={`flex-1 py-3 rounded-xl text-white font-semibold transition disabled:opacity-40 ${
                kind === 'expense'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {saving ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
