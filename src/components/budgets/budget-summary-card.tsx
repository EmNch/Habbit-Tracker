'use client';

import React from 'react';
import { Wallet, TrendingDown, PiggyBank, CalendarDays } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import type { BudgetSummary } from '@/lib/types';

interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export const BudgetSummaryCard = React.memo(function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  const { overview } = summary;
  const pct = overview.spending_percent;

  const ringColor =
    pct >= 100 ? '#ef4444' :
    pct >= 80 ? '#f59e0b' :
    '#10b981';

  return (
    <div className="space-y-4">
      {/* 4 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<Wallet className="w-4 h-4 text-indigo-600" />}
          iconBg="bg-indigo-50 dark:bg-indigo-900/30"
          label="Buget planificat"
          value={`${formatCents(overview.total_planned_cents)} RON`}
        />
        <MetricCard
          icon={<TrendingDown className="w-4 h-4 text-red-500" />}
          iconBg="bg-red-50 dark:bg-red-900/30"
          label="Cheltuit"
          value={`${formatCents(overview.total_spent_cents)} RON`}
          subtext={overview.total_planned_cents > 0 ? `${pct}% din buget` : undefined}
          valueColor={pct >= 100 ? 'text-red-600 dark:text-red-400' : undefined}
        />
        <MetricCard
          icon={<PiggyBank className="w-4 h-4 text-green-500" />}
          iconBg="bg-green-50 dark:bg-green-900/30"
          label="Rămas"
          value={`${formatCents(Math.max(0, overview.remaining_cents))} RON`}
          valueColor={overview.remaining_cents < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
        />
        <MetricCard
          icon={<CalendarDays className="w-4 h-4 text-amber-500" />}
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          label={`Buget zilnic (${overview.days_remaining}z)`}
          value={`${formatCents(overview.daily_budget_cents)} RON`}
        />
      </div>

      {/* Spending ring */}
      {overview.total_planned_cents > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(pct, 100) * 2.64} 264`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{pct}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Progres cheltuieli
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ziua {overview.days_elapsed} din {overview.days_in_month}
              </p>
              {overview.remaining_cents < 0 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Depășit cu {formatCents(Math.abs(overview.remaining_cents))} RON
                </p>
              )}
              <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: ringColor,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

function MetricCard({
  icon,
  iconBg,
  label,
  value,
  subtext,
  valueColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subtext?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${valueColor || 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>
      )}
    </div>
  );
}
