'use client';

import { Sparkles, PartyPopper } from 'lucide-react';
import type { DashboardSummary } from '@/lib/types';

interface MotivationalHeaderProps {
  summary: DashboardSummary;
}

export function MotivationalHeader({ summary }: MotivationalHeaderProps) {
  const { completedToday, totalHabits, completionRateToday } = summary;

  let message: string;
  let emoji: string;
  let subtext: string;
  let accent = false;

  if (totalHabits === 0) {
    return null;
  }

  if (completionRateToday === 100) {
    message = 'Toate obiceiurile completate!';
    emoji = '🎉';
    subtext = 'Excelentă zi de productivitate!';
    accent = true;
  } else if (completedToday === 0) {
    message = 'O zi nouă te așteaptă';
    emoji = '☀️';
    subtext = `${totalHabits} obiceiuri de completat azi`;
  } else if (completionRateToday >= 50) {
    message = 'Ești pe drumul cel bun!';
    emoji = '💪';
    subtext = `Încă ${totalHabits - completedToday} obicei${totalHabits - completedToday === 1 ? '' : 'uri'} rămas${totalHabits - completedToday === 1 ? '' : 'e'}`;
  } else {
    message = 'Să începem ziua!';
    emoji = '🚀';
    subtext = `${completedToday} din ${totalHabits} completate azi`;
  }

  return (
    <div
      className={`relative rounded-xl border p-5 transition ${
        accent
          ? 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{emoji}</span>
        <div>
          <h2 className={`text-lg font-bold ${
            accent ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
          }`}>
            {message}
            {accent && <PartyPopper className="w-5 h-5 inline ml-2 text-green-500" />}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtext}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Progres azi
          </span>
          <span className={`text-xs font-bold ${
            accent ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'
          }`}>
            {completionRateToday}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              accent ? 'bg-green-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${completionRateToday}%` }}
          />
        </div>
      </div>
    </div>
  );
}
