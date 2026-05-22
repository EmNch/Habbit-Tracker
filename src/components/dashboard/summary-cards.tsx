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
      accent: summary.completionRateToday === 100,
      gradient: summary.completionRateToday === 100
        ? 'from-emerald-500 to-green-600'
        : 'from-indigo-500 to-violet-600',
      iconBg: summary.completionRateToday === 100
        ? 'bg-white/20'
        : 'bg-white/20',
    },
    {
      label: 'Streak curent',
      value: `${summary.currentGlobalStreak}`,
      sub: 'zile consecutive',
      icon: Flame,
      accent: false,
      gradient: 'from-orange-500 to-amber-600',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Cel mai bun streak',
      value: `${summary.bestHabitStreak}`,
      sub: 'zile (record)',
      icon: Trophy,
      accent: false,
      gradient: 'from-amber-500 to-yellow-500',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Obiceiuri active',
      value: `${summary.totalHabits}`,
      sub: 'în urmărire',
      icon: Target,
      accent: false,
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 ${
            card.accent ? 'ring-2 ring-emerald-400/50' : ''
          }`}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`} />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/30" />
            <div className="absolute -right-1 -bottom-6 w-20 h-20 rounded-full bg-white/20" />
          </div>

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-white/70 mb-1.5">
                {card.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {card.value}
              </p>
              <p className="text-[11px] text-white/60 mt-1">
                {card.sub}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
