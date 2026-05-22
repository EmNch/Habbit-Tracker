'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { createFinancialEntry } from '@/lib/actions/financial';
import type { FinancialEntryKind, SavingGoal } from '@/lib/types';

interface AddEntrySheetProps {
  open: boolean;
  onClose: () => void;
  kind: FinancialEntryKind;
  savingsGoals?: SavingGoal[];
}

const KIND_LABELS: Record<FinancialEntryKind, string> = {
  income: 'Venit nou',
  expense: 'Cheltuială nouă',
  saving: 'Economie nouă',
};

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  income: ['Salariu', 'Freelance', 'Vânzare', 'Dividende', 'Cadou', 'Altul'],
  expense: ['Mâncare', 'Transport', 'Cazare', 'Utilități', 'Sănătate', 'Educație', 'Distracție', 'Haine', 'Altul'],
  saving: [],
};

export function AddEntrySheet({ open, onClose, kind, savingsGoals = [] }: AddEntrySheetProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [goalId, setGoalId] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  const suggestions = CATEGORY_SUGGESTIONS[kind];

  function handleSubmit() {
    if (!amount) return;
    setSaving(true);
    const fd = new FormData();
    fd.set('kind', kind);
    fd.set('amount', amount);
    fd.set('category', category);
    fd.set('description', description);
    fd.set('entry_date', date);
    if (kind === 'saving' && goalId) fd.set('saving_goal_id', goalId);
    startTransition(async () => {
      await createFinancialEntry(fd);
      setSaving(false);
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toLocaleDateString('sv-SE'));
      setGoalId('');
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--surface)] rounded-t-3xl p-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{KIND_LABELS[kind]}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Suma (lei) *"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setCategory(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    category === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder={kind === 'saving' ? 'Sursă economie' : 'Categorie (opțional)'}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          {kind === 'saving' && savingsGoals.length > 0 && (
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Fără obiectiv</option>
              {savingsGoals.map((g) => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Descriere (opțional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || pending || !amount}
          className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
        >
          {saving || pending ? 'Se salvează...' : 'Adaugă'}
        </button>
      </div>
    </div>
  );
}
