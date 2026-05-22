'use client';

import Link from 'next/link';
import { Target as TargetIcon, Clock, Plus } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { Target } from '@/lib/types';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'pe zi',
  weekly: 'pe saptamana',
  monthly: 'pe luna',
  total: 'in total',
};

interface TargetCountdownProps {
  targets: Target[];
}

export function TargetCountdown({ targets }: TargetCountdownProps) {
  const active = targets
    .filter((t) => !t.is_completed && t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <TargetIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Targete active</h3>
        </div>
        <Link
          href="/targets/new"
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Adaugă
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {active.slice(0, 6).map((target) => {
          const daysLeft = differenceInDays(new Date(target.deadline!), new Date());
          const isOverdue = daysLeft < 0;
          const isUrgent = !isOverdue && daysLeft <= 7;

          return (
            <Link
              key={target.id}
              href={`/targets/${target.id}/edit`}
              className="group block bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-lg">{target.icon}</span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                  {target.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {target.target_value}x {FREQUENCY_LABELS[target.target_frequency]}
              </p>

              <div
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${
                  isOverdue
                    ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                    : isUrgent
                      ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                      : 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                <Clock className="w-3 h-3" />
                {isOverdue ? (
                  'Deadline depășit'
                ) : (
                  <>
                    {daysLeft} {daysLeft === 1 ? 'zi' : 'zile'} rămase
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
