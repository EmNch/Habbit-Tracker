'use client';

import React from 'react';
import { CheckCircle2, Flame, Trophy, Target } from 'lucide-react';
import type { DashboardSummary } from '@/lib/types';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export const SummaryCards = React.memo(function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Completare azi',
      value: `${summary.completedToday}/${summary.totalHabits}`,
      sub: `${summary.completionRateToday}%`,
      icon: CheckCircle2,
      color: summary.completionRateToday === 100
        ? 'text-green-500 bg-green-50 dark:bg-green-900/20'
        : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
      accent: summary.completionRateToday === 100,
    },
    {
      label: 'Streak curent',
      value: `${summary.currentGlobalStreak}`,
      sub: 'zile consecutive',
      icon: Flame,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      accent: false,
    },
    {
      label: 'Cel mai bun streak',
      value: `${summary.bestHabitStreak}`,
      sub: 'zile (record)',
      icon: Trophy,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
      accent: false,
    },
    {
      label: 'Obiceiuri active',
      value: `${summary.totalHabits}`,
      sub: 'în urmărire',
      icon: Target,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl border p-4 transition ${
            card.accent
              ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {card.label}
              </p>
              <p className={`text-2xl font-bold ${
                card.accent ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
              }`}>
                {card.value}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {card.sub}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          {card.accent && (
            <div className="absolute -bottom-1 -right-1 text-6xl opacity-10">
              ✨
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
