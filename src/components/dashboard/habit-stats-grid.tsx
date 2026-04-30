'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Flame, TrendingUp } from 'lucide-react';
import { StreakBadge } from '@/components/gamification/streak-badge';
import type { HabitWithStats, HabitStatsCache } from '@/lib/types';

interface HabitStatsGridProps {
  habits: HabitWithStats[];
}

export function HabitStatsGrid({ habits }: HabitStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {habits.map((habit) => (
        <HabitStatsCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}

function HabitStatsCard({ habit }: { habit: HabitWithStats }) {
  const stats = habit.stats_cache as HabitStatsCache | null;

  return (
    <Link
      href={`/habits/${habit.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
    >
      {/* Mini progress bar at top */}
      <div className="h-1 w-full bg-gray-100 dark:bg-gray-700">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${stats?.completion_rate_7d ?? 0}%`,
            backgroundColor: habit.color,
          }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{habit.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition text-sm">
                {habit.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {habit.todayCompleted ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Completat
                  </span>
                ) : habit.todayEntryExists ? (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Circle className="w-3 h-3 fill-amber-400" />
                    Parțial
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Circle className="w-3 h-3" />
                    Neînceput
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <StreakBadge streak={stats.current_streak} size="sm" />
              <p className="text-[10px] text-gray-400 mt-0.5">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.completion_rate_7d}%
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">7 zile</p>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.total_entries}
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
