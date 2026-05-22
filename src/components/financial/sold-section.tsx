'use client';

import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { FinancialSummary } from '@/lib/types';

function formatLei(cents: number): string {
  return (cents / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface SoldSectionProps {
  summary: FinancialSummary;
}

export function SoldSection({ summary }: SoldSectionProps) {
  const { totalBalanceCents, monthlyIncomeCents, monthlyExpenseCents, totalSavingsCents, debtSummary } = summary;
  const monthlyProfit = monthlyIncomeCents - monthlyExpenseCents;
  const netWorth = totalBalanceCents + totalSavingsCents - debtSummary.totalRemainingCents;

  const cards = [
    {
      label: 'Sold disponibil',
      value: totalBalanceCents,
      gradient: 'from-indigo-500 to-violet-600',
    },
    {
      label: 'Economii totale',
      value: totalSavingsCents,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: monthlyProfit >= 0 ? 'Profit lună' : 'Deficit lună',
      value: monthlyProfit,
      gradient: monthlyProfit >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600',
    },
    {
      label: 'Patrimoniu net',
      sub: 'sold + economii - datorii',
      value: netWorth,
      gradient: netWorth >= 0 ? 'from-violet-500 to-purple-600' : 'from-red-500 to-rose-600',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {cards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl p-4 md:p-5">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative">
              <p className="text-[11px] font-medium text-white/60 mb-1.5">{card.label}</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {formatLei(card.value)}
                <span className="text-xs font-normal ml-1 text-white/50">lei</span>
              </p>
              {card.sub && <p className="text-[10px] text-white/40 mt-0.5">{card.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Luna curentă</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Venituri</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatLei(monthlyIncomeCents)} lei</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Cheltuieli</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">-{formatLei(monthlyExpenseCents)} lei</span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-white/5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Balanță</span>
            <span className={`text-sm font-bold ${monthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {monthlyProfit >= 0 ? '+' : ''}{formatLei(monthlyProfit)} lei
            </span>
          </div>
        </div>

        {monthlyIncomeCents > 0 && (
          <div className="mt-4">
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5">
              <div
                className="bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (monthlyIncomeCents / Math.max(monthlyIncomeCents, monthlyExpenseCents)) * 100)}%` }}
              />
              <div
                className="bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (monthlyExpenseCents / Math.max(monthlyIncomeCents, monthlyExpenseCents)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-medium text-emerald-500">venituri</span>
              <span className="text-[10px] font-medium text-rose-400">cheltuieli</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
