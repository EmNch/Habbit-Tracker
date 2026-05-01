'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createCategory } from '@/lib/actions/budgets';
import type { BudgetCategoryKind } from '@/lib/types';

const ICONS = ['🍕', '🚗', '🏠', '🎬', '👕', '💊', '📚', '✈️', '💻', '🎮', '🏋️', '💇', '🎁', '📱', '💰', '💼', '📈', '🎵', '🐕', '🛒'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

interface AddCategorySheetProps {
  open: boolean;
  onClose: () => void;
}

export function AddCategorySheet({ open, onClose }: AddCategorySheetProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#6366f1');
  const [kind, setKind] = useState<BudgetCategoryKind>('expense');
  const [limitDisplay, setLimitDisplay] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('icon', icon);
    formData.append('color', color);
    formData.append('kind', kind);
    if (limitDisplay && kind === 'expense') {
      formData.append('monthly_limit_cents', limitDisplay);
    }

    await createCategory(formData);
    setSaving(false);
    setName('');
    setLimitDisplay('');
    onClose();
  }

  if (!open) return null;

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
              Categorie noua
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
              Cheltuiala
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

          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume categorie"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          {/* Icon picker */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition ${
                    icon === i
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Culoare</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Monthly limit (expenses only) */}
          {kind === 'expense' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Limita lunara (RON, optional)
              </label>
              <input
                type="number"
                value={limitDisplay}
                onChange={(e) => setLimitDisplay(e.target.value)}
                placeholder="ex: 500"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-40"
          >
            {saving ? 'Se salveaza...' : 'Salveaza categoria'}
          </button>
        </div>
      </div>
    </>
  );
}
