'use client';

import React from 'react';
import { Trophy, Zap, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import type { TransactionWithCategory } from '@/lib/types';

interface QuickStatsProps {
  transactions: TransactionWithCategory[];
  daysElapsed: number;
}

export const QuickStats = React.memo(function QuickStats({ transactions, daysElapsed }: QuickStatsProps) {
  const expenses = transactions.filter((t) => t.kind === 'expense');

  if (expenses.length === 0) {
    return null;
  }

  // Biggest expense
  const biggest = expenses.reduce((max, t) => t.amount_cents > max.amount_cents ? t : max, expenses[0]);

  // Average daily spending
  const totalExpenses = expenses.reduce((s, t) => s + t.amount_cents, 0);
  const avgDaily = daysElapsed > 0 ? Math.round(totalExpenses / daysElapsed) : 0;

  // Most frequent category
  const catCount = new Map<string, { name: string; icon: string; count: number }>();
  for (const t of expenses) {
    const existing = catCount.get(t.category_id);
    if (existing) existing.count++;
    else catCount.set(t.category_id, { name: t.category?.name || '?', icon: t.category?.icon || '📦', count: 1 });
  }
  const topCat = [...catCount.values()].sort((a, b) => b.count - a.count)[0];

  // Total transactions count
  const totalTx = transactions.length;

  const stats = [
    {
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      label: 'Cea mai mare cheltuială',
      value: `${formatCents(biggest.amount_cents)} RON`,
      sub: biggest.category?.name || '',
    },
    {
      icon: <Zap className="w-4 h-4 text-indigo-500" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      label: 'Media zilnică',
      value: `${formatCents(avgDaily)} RON`,
      sub: `${daysElapsed} zile`,
    },
    {
      icon: <Hash className="w-4 h-4 text-green-500" />,
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      label: 'Total tranzacții',
      value: String(totalTx),
      sub: `${expenses.length} cheltuieli`,
    },
    {
      icon: <ArrowUpRight className="w-4 h-4 text-purple-500" />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      label: 'Categorie activă',
      value: topCat.name,
      sub: `${topCat.icon} ${topCat.count} tranzacții`,
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Statistici rapide
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.label}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums truncate">
              {stat.value}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
});
