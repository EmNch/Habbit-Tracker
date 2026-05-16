'use client';

import { PieChart as PieIcon } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import type { CategoryBudget } from '@/lib/types';

interface BudgetAllocationCardProps {
  budgets: CategoryBudget[];
  totalIncomeCents: number;
}

export function BudgetAllocationCard({ budgets, totalIncomeCents }: BudgetAllocationCardProps) {
  const expenseBudgets = budgets.filter(
    (b) => b.category.kind === 'expense' && b.limit_cents !== null,
  );

  const totalAllocated = expenseBudgets.reduce((s, b) => s + (b.limit_cents || 0), 0);
  const allocPercent = totalIncomeCents > 0 ? Math.round((totalAllocated / totalIncomeCents) * 100) : 0;
  const isOver = allocPercent > 100;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <PieIcon className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Alocare buget
        </h3>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className={`text-2xl font-bold tabular-nums ${
          isOver ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
        }`}>
          {allocPercent}%
        </span>
        <span className="text-xs text-gray-400 mb-1">din venituri alocat</span>
      </div>

      {isOver && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-2">
          Ai alocat mai mult de 100% din venituri!
        </p>
      )}

      {/* Stacked bar */}
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full flex overflow-hidden">
        {expenseBudgets.map((b) => {
          const pct = totalIncomeCents > 0 ? (b.limit_cents! / totalIncomeCents) * 100 : 0;
          return (
            <div
              key={b.category.id}
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: b.category.color,
              }}
              title={`${b.category.name}: ${formatCents(b.limit_cents!)} RON`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {expenseBudgets.map((b) => (
          <div key={b.category.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.category.color }} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{b.category.name}</span>
          </div>
        ))}
        {allocPercent < 100 && totalIncomeCents > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
            <span className="text-[10px] text-gray-400">Nealocat</span>
          </div>
        )}
      </div>
    </div>
  );
}
