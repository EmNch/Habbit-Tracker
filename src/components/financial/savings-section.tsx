'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Target, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { FinancialEntry, SavingGoal } from '@/lib/types';
import { EntryList } from './entry-list';
import { AddEntrySheet } from './add-entry-sheet';
import { AddGoalSheet } from './add-goal-sheet';
import { deleteSavingsGoal } from '@/lib/actions/financial';

function formatLei(cents: number): string {
  return (cents / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

interface GoalProps {
  goal: SavingGoal;
  entries: FinancialEntry[];
  allGoals: SavingGoal[];
}

function GoalCard({ goal, entries, allGoals }: GoalProps) {
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const percent = goal.target_amount_cents > 0 ? Math.round((goal.saved_cents / goal.target_amount_cents) * 100) : 0;
  const isComplete = percent >= 100;
  const dueInfo = goal.deadline ? daysUntil(goal.deadline) : null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{goal.icon}</span>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{goal.name}</p>
            {goal.deadline && (
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className={`text-[10px] ${dueInfo !== null && dueInfo < 0 ? 'text-red-500' : dueInfo !== null && dueInfo < 14 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {dueInfo !== null && dueInfo < 0 ? `Expirat ${Math.abs(dueInfo)} zile` : dueInfo !== null ? `${dueInfo} zile rămas` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); startTransition(async () => { await deleteSavingsGoal(goal.id); }); }}
            disabled={pending}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">{formatLei(goal.saved_cents)} lei</span>
          <span className="text-gray-500">{formatLei(goal.target_amount_cents)} lei</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : ''}`}
            style={{ width: `${Math.min(100, percent)}%`, backgroundColor: isComplete ? undefined : goal.color }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 text-right">{percent}%</p>
      </div>

      {expanded && entries.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <EntryList entries={entries} savingsGoals={allGoals} />
        </div>
      )}
      {expanded && entries.length === 0 && (
        <p className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-center py-2">
          Nicio economie atribuită încă
        </p>
      )}
    </div>
  );
}

interface SavingsSectionProps {
  goals: SavingGoal[];
  savingsEntries: FinancialEntry[];
}

export function SavingsSection({ goals, savingsEntries }: SavingsSectionProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const totalSaved = savingsEntries.reduce((s, e) => s + e.amount_cents, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount_cents, 0);

  // Group savings entries by goal
  const goalEntries: Record<string, FinancialEntry[]> = {};
  const unassignedEntries: FinancialEntry[] = [];
  for (const entry of savingsEntries) {
    if (entry.saving_goal_id) {
      if (!goalEntries[entry.saving_goal_id]) goalEntries[entry.saving_goal_id] = [];
      goalEntries[entry.saving_goal_id].push(entry);
    } else {
      unassignedEntries.push(entry);
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total economisit</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatLei(totalSaved)} lei
          </p>
          {totalTarget > 0 && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              din {formatLei(totalTarget)} lei țintă ({Math.round((totalSaved / totalTarget) * 100)}%)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <Target className="w-4 h-4" />
            Obiectiv
          </button>
          <button
            onClick={() => setShowAddEntry(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Economie
          </button>
        </div>
      </div>

      {/* Goals with their entries */}
      {goals.length > 0 && (
        <div className="space-y-2 mb-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              entries={goalEntries[goal.id] || []}
              allGoals={goals}
            />
          ))}
        </div>
      )}

      {/* Unassigned savings */}
      {unassignedEntries.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Economii neatribuite ({formatLei(unassignedEntries.reduce((s, e) => s + e.amount_cents, 0))} lei)
          </h4>
          <EntryList entries={unassignedEntries} savingsGoals={goals} />
        </div>
      )}

      {goals.length === 0 && savingsEntries.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Istoric economii</h4>
          <EntryList entries={savingsEntries} savingsGoals={goals} />
        </div>
      )}

      <AddEntrySheet open={showAddEntry} onClose={() => setShowAddEntry(false)} kind="saving" savingsGoals={goals} />
      <AddGoalSheet open={showAddGoal} onClose={() => setShowAddGoal(false)} />
    </div>
  );
}
