'use client';

import Link from 'next/link';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, ChevronRight } from 'lucide-react';
import type { FinancialSummary as FinancialSummaryType } from '@/lib/types';

function formatLei(cents: number): string {
  const lei = cents / 100;
  return lei.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface FinancialOverviewProps {
  summary: FinancialSummaryType;
}

export function FinancialOverview({ summary }: FinancialOverviewProps) {
  const { totalBalanceCents, monthlyIncomeCents, monthlyExpenseCents, totalSavingsCents, debtSummary } = summary;
  const hasDebts = debtSummary.debts.length > 0;

  const items = [
    {
      label: 'Sold',
      value: formatLei(totalBalanceCents),
      icon: Wallet,
      gradient: 'from-indigo-500 to-violet-600',
    },
    {
      label: 'Venituri',
      value: formatLei(monthlyIncomeCents),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      label: 'Cheltuieli',
      value: formatLei(monthlyExpenseCents),
      icon: TrendingDown,
      gradient: 'from-rose-500 to-red-600',
    },
    {
      label: 'Economii',
      value: formatLei(totalSavingsCents),
      icon: PiggyBank,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Datorii',
      value: hasDebts ? formatLei(debtSummary.totalRemainingCents) : '0',
      icon: AlertTriangle,
      gradient: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <Link href="/financiar" className="block">
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4 md:p-5 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Stare Financiară</h3>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-200" />
        </div>

        {/* Responsive grid: 5 cols on xl, scrollable on smaller */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
          {items.map((item) => (
            <div key={item.label} className="flex-shrink-0 snap-start flex-1 min-w-[80px]">
              <div className={`rounded-xl p-3 md:p-4 bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full bg-white/10" />
                <div className="relative">
                  <item.icon className="w-4 h-4 text-white/80 mb-2" />
                  <p className="text-sm md:text-base font-bold text-white">{item.value}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
