'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import type { BudgetSummary } from '@/lib/types';

interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  const isNegative = summary.balance_cents < 0;

  return (
    <div className={`rounded-xl border p-5 ${
      isNegative
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : summary.balance_cents === 0
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Wallet className={`w-5 h-5 ${isNegative ? 'text-red-500' : 'text-indigo-600'}`} />
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Sold ramas
        </span>
      </div>

      <p className={`text-3xl font-bold tabular-nums ${
        isNegative
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-900 dark:text-white'
      }`}>
        {isNegative ? '-' : ''}{formatCents(Math.abs(summary.balance_cents))} RON
      </p>

      {isNegative && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
          Ai cheltuit mai mult decat ai castigat luna aceasta
        </p>
      )}

      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Venituri</p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
              {formatCents(summary.total_income_cents)} RON
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cheltuieli</p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
              {formatCents(summary.total_expense_cents)} RON
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
