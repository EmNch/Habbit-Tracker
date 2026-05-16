'use client';

import { Heart } from 'lucide-react';
import type { BudgetSummary } from '@/lib/types';

interface HealthScoreCardProps {
  summary: BudgetSummary;
}

export function HealthScoreCard({ summary }: HealthScoreCardProps) {
  const { overview, insights, total_income_cents, total_expense_cents } = summary;

  let score = 100;

  // Penalize spending percentage (0-40 points)
  const spendPct = overview.spending_percent;
  if (spendPct > 100) score -= 40;
  else if (spendPct > 80) score -= 20 + ((spendPct - 80) / 20) * 20;
  else if (spendPct > 60) score -= 5 + ((spendPct - 60) / 20) * 15;

  // Penalize low/negative savings rate (0-30 points)
  const savingsRate = total_income_cents > 0 ? (total_income_cents - total_expense_cents) / total_income_cents * 100 : 0;
  if (savingsRate < 0) score -= 30;
  else if (savingsRate < 10) score -= 20;
  else if (savingsRate < 20) score -= 10;

  // Penalize critical insights (0-30 points)
  const critical = insights.filter((i) => i.severity === 'critical').length;
  const warning = insights.filter((i) => i.severity === 'warning').length;
  const caution = insights.filter((i) => i.severity === 'caution').length;
  score -= critical * 10;
  score -= warning * 5;
  score -= caution * 2;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#f97316' :
    '#ef4444';

  const label =
    score >= 80 ? 'Excelent' :
    score >= 60 ? 'Bine' :
    score >= 40 ? 'Atenție' :
    'Critic';

  const tip =
    score >= 80 ? 'Bugetul tău e în formă bună!' :
    score >= 60 ? 'E ok, dar ai putea economisi mai mult' :
    score >= 40 ? 'Câteva categorii necesită atenție' :
    'Bugetul e sub presiune - revizuiește cheltuielile';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sănătate buget
        </h3>
      </div>

      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{score}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color }}>
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {tip}
          </p>
          {critical > 0 && (
            <p className="text-xs text-red-500 mt-1">
              {critical} categor{critical === 1 ? 'ie' : 'ii'} depășite
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
