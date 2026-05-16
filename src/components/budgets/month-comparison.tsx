'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import type { MonthlyTrend } from '@/lib/types';

const MONTH_ABBR = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthComparisonProps {
  trends: MonthlyTrend[];
}

export function MonthComparison({ trends }: MonthComparisonProps) {
  if (trends.length < 2) return null;

  const current = trends[trends.length - 1];
  const previous = trends[trends.length - 2];

  const curMonthIdx = parseInt(current.month.split('-')[1], 10) - 1;
  const prevMonthIdx = parseInt(previous.month.split('-')[1], 10) - 1;

  const incomeDiff = current.income_cents - previous.income_cents;
  const expenseDiff = current.expense_cents - previous.expense_cents;
  const balanceDiff = current.balance_cents - previous.balance_cents;

  const comparisons = [
    {
      label: 'Venituri',
      current: current.income_cents,
      diff: incomeDiff,
      prevLabel: MONTH_ABBR[prevMonthIdx],
    },
    {
      label: 'Cheltuieli',
      current: current.expense_cents,
      diff: expenseDiff,
      prevLabel: MONTH_ABBR[prevMonthIdx],
    },
    {
      label: 'Sold',
      current: current.balance_cents,
      diff: balanceDiff,
      prevLabel: MONTH_ABBR[prevMonthIdx],
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        vs {MONTH_ABBR[prevMonthIdx]}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {comparisons.map((c) => {
          const isPositive = c.label === 'Cheltuieli' ? c.diff <= 0 : c.diff >= 0;
          const pct = c.current > 0 ? Math.round(Math.abs(c.diff) / c.current * 100) : 0;

          return (
            <div
              key={c.label}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
            >
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                {c.label}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {formatCents(c.current)}
              </p>
              <div className={`flex items-center gap-1 mt-1 ${
                c.diff === 0 ? 'text-gray-400' : isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {c.diff === 0 ? (
                  <Minus className="w-3 h-3" />
                ) : isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium tabular-nums">
                  {c.diff >= 0 ? '+' : ''}{formatCents(Math.abs(c.diff))}
                </span>
                {pct > 0 && (
                  <span className="text-[10px] text-gray-400">({pct}%)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
