'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Flame, TrendingUp, Minus } from 'lucide-react';
import { StreakBadge } from '@/components/gamification/streak-badge';
import type { HabitWithStats, HabitStatsCache } from '@/lib/types';

interface HabitStatsGridProps {
  habits: HabitWithStats[];
}

export function HabitStatsGrid({ habits }: HabitStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
      {habits.map((habit) => (
        <HabitStatsCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}

function HabitStatsCard({ habit }: { habit: HabitWithStats }) {
  const stats = habit.stats_cache as HabitStatsCache | null;

  const statusConfig = habit.todayCompleted
    ? { label: 'Completat', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500' }
    : habit.todayEntryExists
      ? { label: 'Parțial', icon: Circle, color: 'text-amber-500', bg: 'bg-amber-500' }
      : { label: 'Neînceput', icon: Minus, color: 'text-gray-400', bg: 'bg-gray-300 dark:bg-gray-600' };

  return (
    <Link
      href={`/habits/${habit.id}`}
      className="group block bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gray-100 dark:bg-white/5">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${stats?.completion_rate_7d ?? 0}%`,
            backgroundColor: habit.color,
          }}
        />
      </div>

      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${habit.color}15` }}
            >
              {habit.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                {habit.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <statusConfig.icon className={`w-3.5 h-3.5 ${statusConfig.color} ${habit.todayCompleted ? '' : ''}`} />
                <span className={`text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="flex flex-col items-center">
              <StreakBadge streak={stats.current_streak} size="sm" />
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.completion_rate_7d}%
                </span>
              </div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">7 zile</p>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.total_entries}
              </span>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">Total</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
