'use client';

import Link from 'next/link';
import { Target as TargetIcon, Clock, Plus } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
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
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-indigo-600" />
          Targete active
        </h2>
        <Link
          href="/targets/new"
          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Adauga
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {active.slice(0, 6).map((target) => {
          const daysLeft = differenceInDays(new Date(target.deadline!), new Date());
          const isOverdue = daysLeft < 0;
          const isUrgent = !isOverdue && daysLeft <= 7;

          return (
            <Link
              key={target.id}
              href={`/targets/${target.id}/edit`}
              className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{target.icon}</span>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {target.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {target.target_value}x {FREQUENCY_LABELS[target.target_frequency]}
              </p>

              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit ${
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : isUrgent
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                <Clock className="w-3 h-3" />
                {isOverdue ? (
                  'Deadline depasit'
                ) : (
                  <>
                    {daysLeft} {daysLeft === 1 ? 'zi' : 'zile'} ramase
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
