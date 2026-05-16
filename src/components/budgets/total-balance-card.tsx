'use client';

import { Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';

interface TotalBalanceCardProps {
  income: number;
  expense: number;
  balance: number;
}

export function TotalBalanceCard({ income, expense, balance }: TotalBalanceCardProps) {
  const isNegative = balance < 0;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Landmark className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sold total (istoric)
        </h3>
      </div>

      <p className={`text-2xl font-bold tabular-nums ${
        isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
      }`}>
        {isNegative ? '-' : ''}{formatCents(Math.abs(balance))} RON
      </p>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <div>
            <p className="text-[10px] text-gray-400">Total venituri</p>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 tabular-nums">
              {formatCents(income)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          <div>
            <p className="text-[10px] text-gray-400">Total cheltuieli</p>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 tabular-nums">
              {formatCents(expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
