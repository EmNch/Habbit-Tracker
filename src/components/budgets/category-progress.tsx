'use client';

import { formatCents } from '@/lib/utils/format';
import type { CategoryBudget } from '@/lib/types';

interface CategoryProgressProps {
  budgets: CategoryBudget[];
  onAddCategory: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  safe: '#10b981',
  normal: '#6366f1',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export function CategoryProgress({ budgets, onAddCategory }: CategoryProgressProps) {
  const expenses = budgets.filter((b) => b.category.kind === 'expense');
  const incomes = budgets.filter((b) => b.category.kind === 'income');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Bugete pe categorii
        </h2>
        <button
          onClick={onAddCategory}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          + Categorie
        </button>
      </div>

      {expenses.map((budget) => (
        <CategoryBar key={budget.category.id} budget={budget} />
      ))}

      {incomes.length > 0 && (
        <>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Venituri</p>
          </div>
          {incomes.map((budget) => (
            <IncomeRow key={budget.category.id} budget={budget} />
          ))}
        </>
      )}
    </div>
  );
}

function CategoryBar({ budget }: { budget: CategoryBudget }) {
  const { category, spent_cents, limit_cents, percent, status } = budget;
  const barColor = STATUS_COLORS[status];
  const isOver = limit_cents !== null && spent_cents > limit_cents;
  const displayPercent = isOver ? Math.min(percent, 150) : percent;
  const overflow = displayPercent > 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{category.icon}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {category.name}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm tabular-nums ${isOver ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
            {formatCents(spent_cents)}
          </span>
          {limit_cents !== null && (
            <span className="text-sm text-gray-400">/{formatCents(limit_cents)}</span>
          )}
        </div>
      </div>

      <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-visible">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${overflow ? 100 : displayPercent}%`,
            backgroundColor: barColor,
          }}
        />
        {overflow && (
          <div
            className="absolute top-0 h-full rounded-full opacity-50 animate-pulse"
            style={{
              left: '100%',
              width: `${displayPercent - 100}%`,
              maxWidth: '50%',
              backgroundColor: barColor,
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs font-medium ${
          status === 'danger' ? 'text-red-500' :
          status === 'warning' ? 'text-amber-500' : 'text-gray-400'
        }`}>
          {status === 'danger' ? 'Depasit!' : status === 'warning' ? 'Atentie' : ''}
        </span>
        <span className="text-xs text-gray-400 tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}

function IncomeRow({ budget }: { budget: CategoryBudget }) {
  const { category, spent_cents } = budget;

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{category.icon}</span>
        <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
      </div>
      <span className="text-sm font-medium text-green-600 dark:text-green-400 tabular-nums">
        +{formatCents(spent_cents)} RON
      </span>
    </div>
  );
}
