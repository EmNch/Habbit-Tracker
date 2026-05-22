'use client';

import { useState, useTransition } from 'react';
import { Trash2, Target } from 'lucide-react';
import { deleteFinancialEntry, updateEntryGoal } from '@/lib/actions/financial';
import type { FinancialEntry, SavingGoal } from '@/lib/types';

function formatLei(cents: number): string {
  return (cents / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface EntryListProps {
  entries: FinancialEntry[];
  savingsGoals?: SavingGoal[];
}

export function EntryList({ entries, savingsGoals = [] }: EntryListProps) {
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
        Nicio intrare înregistrată
      </p>
    );
  }

  const goalMap = new Map(savingsGoals.map((g) => [g.id, g]));

  // Group by date
  const grouped: Record<string, FinancialEntry[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.entry_date]) grouped[entry.entry_date] = [];
    grouped[entry.entry_date].push(entry);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
            {new Date(date + 'T00:00:00').toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <div className="space-y-1">
            {items.map((entry) => {
              const isDeleting = pending && deleteId === entry.id;
              const isIncome = entry.kind === 'income';
              const isSaving = entry.kind === 'saving';
              const goal = entry.saving_goal_id ? goalMap.get(entry.saving_goal_id) : null;

              return (
                <div
                  key={entry.id}
                  className={`group flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-200 ${
                    isDeleting ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {entry.category || (isIncome ? 'Venit' : isSaving ? 'Economie' : 'Cheltuială')}
                      </span>
                      {entry.description && (
                        <span className="text-xs text-gray-400 truncate hidden sm:inline">{entry.description}</span>
                      )}
                    </div>
                    {isSaving && savingsGoals.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Target className="w-3 h-3 text-gray-400" />
                        {goal ? (
                          <span className="text-[10px] font-medium" style={{ color: goal.color }}>
                            {goal.icon} {goal.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Fără obiectiv</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-sm font-bold whitespace-nowrap ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : isSaving ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatLei(entry.amount_cents)} lei
                    </span>

                    {isSaving && savingsGoals.length > 0 && (
                      <select
                        value={entry.saving_goal_id || ''}
                        onChange={(e) => {
                          const val = e.target.value || null;
                          startTransition(async () => {
                            await updateEntryGoal(entry.id, val);
                          });
                        }}
                        disabled={pending}
                        className="text-[10px] px-1 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-500 dark:text-gray-400 outline-none cursor-pointer opacity-0 group-hover:opacity-100 transition"
                        title="Atribuie obiectiv"
                      >
                        <option value="">Fără obiectiv</option>
                        {savingsGoals.map((g) => (
                          <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={() => {
                        setDeleteId(entry.id);
                        startTransition(async () => {
                          await deleteFinancialEntry(entry.id);
                          setDeleteId(null);
                        });
                      }}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition opacity-0 group-hover:opacity-100"
                      title="Șterge"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
