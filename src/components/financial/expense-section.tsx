'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { FinancialEntry } from '@/lib/types';
import { EntryList } from './entry-list';
import { AddEntrySheet } from './add-entry-sheet';

interface ExpenseSectionProps {
  entries: FinancialEntry[];
}

export function ExpenseSection({ entries }: ExpenseSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const total = entries.reduce((s, e) => s + e.amount_cents, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total cheltuieli</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {(total / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} lei
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Cheltuială
        </button>
      </div>

      <EntryList entries={entries} />

      <AddEntrySheet open={showAdd} onClose={() => setShowAdd(false)} kind="expense" />
    </div>
  );
}
