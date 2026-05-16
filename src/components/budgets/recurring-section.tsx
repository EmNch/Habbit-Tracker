'use client';

import { Repeat, Plus, Trash2 } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import { deleteRecurringTemplate } from '@/lib/actions/budgets';
import type { RecurringTemplateWithCategory } from '@/lib/types';

interface RecurringSectionProps {
  templates: RecurringTemplateWithCategory[];
  onAdd: () => void;
  onChanged: () => void;
}

export function RecurringSection({ templates, onAdd, onChanged }: RecurringSectionProps) {
  async function handleDelete(id: string) {
    await deleteRecurringTemplate(id);
    onChanged();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Tranzacții recurente
          </h2>
        </div>
        <button
          onClick={onAdd}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          + Recurentă
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-sm text-gray-400">
            Nicio tranzacție recurentă setată
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-500 mt-1">
            Adaugă chirie, salariu sau alte plăți lunare
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/50 group"
            >
              <span className="text-base">{tmpl.category?.icon || '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">
                  {tmpl.category?.name || 'Necunoscut'}
                </p>
                <p className="text-xs text-gray-400">
                  Ziua {tmpl.day_of_month} lunar
                  {tmpl.note && ` · ${tmpl.note}`}
                </p>
              </div>
              <span className={`text-sm font-medium tabular-nums ${
                tmpl.kind === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {tmpl.kind === 'expense' ? '-' : '+'}{formatCents(tmpl.amount_cents)} RON
              </span>
              <button
                onClick={() => handleDelete(tmpl.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
