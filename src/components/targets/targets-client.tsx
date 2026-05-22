'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Target as TargetIcon, Clock, CheckCircle2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { deleteTarget, toggleTargetComplete, archiveTarget, reactivateTarget } from '@/lib/actions/targets';
import { differenceInDays, format } from 'date-fns';
import type { Target } from '@/lib/types';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'pe zi',
  weekly: 'pe saptamana',
  monthly: 'pe luna',
  total: 'in total',
};

interface TargetsClientProps {
  initialTargets: Target[];
  archivedTargets: Target[];
}

export function TargetsClient({ initialTargets, archivedTargets }: TargetsClientProps) {
  const [targets, setTargets] = useState(initialTargets);
  const [archived, setArchived] = useState(archivedTargets);
  const [showArchived, setShowArchived] = useState(false);

  async function handleDelete(id: string) {
    await deleteTarget(id);
    setTargets((t) => t.filter((x) => x.id !== id));
    setArchived((a) => a.filter((x) => x.id !== id));
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

  async function handleArchive(id: string) {
    await archiveTarget(id);
    const target = targets.find((t) => t.id === id);
    setTargets((t) => t.filter((x) => x.id !== id));
    if (target) setArchived((a) => [{ ...target, is_archived: true }, ...a]);
  }

  async function handleReactivate(id: string) {
    await reactivateTarget(id);
    const target = archived.find((t) => t.id === id);
    setArchived((a) => a.filter((x) => x.id !== id));
    if (target) setTargets((t) => [...t, { ...target, is_archived: false }]);
  }

  const active = targets.filter((t) => !t.is_completed);
  const completed = targets.filter((t) => t.is_completed);

  return (
    <>
      {targets.length === 0 && archived.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <TargetIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Nu ai inca niciun target. Adauga unul!
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Active ({active.length})
          </h2>
          {active.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onToggle={handleToggle}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Completate ({completed.length})
          </h2>
          {completed.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onToggle={handleToggle}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition mb-3"
          >
            <Archive className="w-4 h-4" />
            Arhivate ({archived.length})
          </button>

          {showArchived && (
            <div className="space-y-3 opacity-60">
              {archived.map((target) => (
                <ArchivedTargetCard
                  key={target.id}
                  target={target}
                  onReactivate={handleReactivate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TargetCard({
  target,
  onToggle,
  onArchive,
  onDelete,
}: {
  target: Target;
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const daysLeft = target.deadline
    ? differenceInDays(new Date(target.deadline), new Date())
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div
      className={`group bg-[var(--surface)] border rounded-2xl p-4 md:p-5 transition-all duration-300 ${
        target.is_completed
          ? 'border-emerald-200 dark:border-emerald-800/50 opacity-60'
          : isOverdue
            ? 'border-rose-200 dark:border-rose-800/50'
            : 'border-[var(--border-color)] hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggle(target.id)}
            className={`mt-0.5 flex-shrink-0 transition ${
              target.is_completed
                ? 'text-emerald-500'
                : 'text-gray-300 dark:text-gray-600 hover:text-indigo-500'
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
                  className={`font-bold text-sm ${
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

            {target.deadline && !target.is_completed && (
              <div
                className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${
                  isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : daysLeft !== null && daysLeft <= 7
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isOverdue ? (
                  <span>Deadline depășit</span>
                ) : (
                  <span>
                    {daysLeft} {daysLeft === 1 ? 'zi' : 'zile'} până la {format(new Date(target.deadline), 'dd MMM yyyy')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onArchive(target.id)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-indigo-500 transition opacity-0 group-hover:opacity-100"
            title="Arhivează"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(target.id)}
            className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
            title="Șterge"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArchivedTargetCard({
  target,
  onReactivate,
  onDelete,
}: {
  target: Target;
  onReactivate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg">{target.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-400 dark:text-gray-500 truncate line-through">
              {target.name}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              {target.target_value}x {FREQUENCY_LABELS[target.target_frequency] || target.target_frequency}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onReactivate(target.id)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-indigo-500 transition"
            title="Reactivează"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(target.id)}
            className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition"
            title="Șterge definitiv"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
