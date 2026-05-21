'use client';

import React from 'react';
import { PiggyBank } from 'lucide-react';

interface SavingsRateCardProps {
  incomeCents: number;
  expenseCents: number;
}

export const SavingsRateCard = React.memo(function SavingsRateCard({ incomeCents, expenseCents }: SavingsRateCardProps) {
  const saved = incomeCents - expenseCents;
  const rate = incomeCents > 0 ? Math.round((saved / incomeCents) * 100) : 0;
  const clampedRate = Math.max(-100, Math.min(100, rate));

  const color =
    rate >= 20 ? '#10b981' :
    rate >= 10 ? '#f59e0b' :
    rate >= 0 ? '#f97316' :
    '#ef4444';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <PiggyBank className="w-4 h-4 text-green-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rata de economisire
        </h3>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {rate}%
        </span>
        <span className="text-xs text-gray-400 mb-1">din venituri</span>
      </div>

      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.abs(clampedRate)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {rate >= 20 ? 'Economisire excelentă!' :
         rate >= 10 ? 'Economisire decentă' :
         rate >= 0 ? 'Încearcă să economisești mai mult' :
         'Cheltuieli peste venituri'}
      </p>
    </div>
  );
});
