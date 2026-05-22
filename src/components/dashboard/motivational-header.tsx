'use client';

import { Zap, PartyPopper } from 'lucide-react';
import type { DashboardSummary } from '@/lib/types';

interface MotivationalHeaderProps {
  summary: DashboardSummary;
}

export function MotivationalHeader({ summary }: MotivationalHeaderProps) {
  const { completedToday, totalHabits, completionRateToday } = summary;

  if (totalHabits === 0) return null;

  let message: string;
  let subtext: string;
  let accent = false;

  if (completionRateToday === 100) {
    message = 'Toate obiceiurile completate!';
    subtext = 'Excelentă zi de productivitate!';
    accent = true;
  } else if (completedToday === 0) {
    message = 'O zi nouă te așteaptă';
    subtext = `${totalHabits} obiceiuri de completat azi`;
  } else if (completionRateToday >= 50) {
    message = 'Ești pe drumul cel bun!';
    subtext = `Încă ${totalHabits - completedToday} obicei${totalHabits - completedToday === 1 ? '' : 'uri'} rămas${totalHabits - completedToday === 1 ? '' : 'e'}`;
  } else {
    message = 'Să începem ziua!';
    subtext = `${completedToday} din ${totalHabits} completate azi`;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 md:p-6 transition-all duration-300 ${
      accent
        ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20'
        : 'bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-600/20'
    }`}>
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute right-12 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
          {accent ? <PartyPopper className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-white truncate">
            {message}
          </h2>
          <p className="text-sm text-white/60 mt-0.5">
            {subtext}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/50">
            Progres azi
          </span>
          <span className="text-sm font-bold text-white">
            {completionRateToday}%
          </span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-white/80 transition-all duration-700 ease-out"
            style={{ width: `${completionRateToday}%` }}
          />
        </div>
      </div>
    </div>
  );
}
