'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Target as TargetIcon, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { getTargets, deleteTarget, toggleTargetComplete } from '@/lib/actions/targets';
import { differenceInDays, format } from 'date-fns';
import type { Target } from '@/lib/types';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'pe zi',
  weekly: 'pe saptamana',
  monthly: 'pe luna',
  total: 'in total',
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTargets().then((data) => {
      setTargets(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    await deleteTarget(id);
    setTargets((t) => t.filter((x) => x.id !== id));
  }

  async function handleToggle(id: string) {
    await toggleTargetComplete(id);
    setTargets((t) =>
      t.map((x) =>
        x.id === id
          ? { ...x, is_completed: !x.is_completed, completed_at: !x.is_completed ? new Date().toISOString() : null }
          : x,
      ),
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const active = targets.filter((t) => !t.is_completed);
  const completed = targets.filter((t) => t.is_completed);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Targete
        </h1>
        <Link
          href="/targets/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Target nou
        </Link>
      </div>

      {targets.length === 0 && (
        <div className="text-center py-16">
          <TargetIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nu ai inca niciun target. Adauga unul!
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Active ({active.length})
          </h2>
          {active.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Completate ({completed.length})
          </h2>
          {completed.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TargetCard({
  target,
  onToggle,
  onDelete,
}: {
  target: Target;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const daysLeft = target.deadline
    ? differenceInDays(new Date(target.deadline), new Date())
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition ${
        target.is_completed
          ? 'border-green-200 dark:border-green-800 opacity-60'
          : isOverdue
            ? 'border-red-200 dark:border-red-800'
            : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggle(target.id)}
            className={`mt-0.5 flex-shrink-0 ${
              target.is_completed
                ? 'text-green-500'
                : 'text-gray-300 dark:text-gray-600 hover:text-indigo-400'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <Link
              href={`/targets/${target.id}/edit`}
              className="block"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{target.icon}</span>
                <h3
                  className={`font-semibold text-sm ${
                    target.is_completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {target.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {target.target_value}x {FREQUENCY_LABELS[target.target_frequency] || target.target_frequency}
              </p>
            </Link>

            {/* Deadline countdown */}
            {target.deadline && !target.is_completed && (
              <div
                className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
                  isOverdue
                    ? 'text-red-600 dark:text-red-400'
                    : daysLeft !== null && daysLeft <= 7
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isOverdue ? (
                  <span>Deadline depasit</span>
                ) : (
                  <span>
                    {daysLeft} {daysLeft === 1 ? 'zi' : 'zile'} ramase pana la {format(new Date(target.deadline), 'dd MMM yyyy')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(target.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
