'use client';

import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';

interface SavingsGoalProps {
  savedCents: number;
  yearMonth?: string;
}

export function SavingsGoal({ savedCents, yearMonth }: SavingsGoalProps) {
  const key = yearMonth ? `savings-goal-${yearMonth}` : 'savings-goal-current';
  const [goalCents, setGoalCents] = useState<number>(0);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setGoalCents(parseInt(stored, 10) || 0);
  }, [key]);

  function handleSave() {
    const cents = Math.round(parseFloat(inputValue) * 100) || 0;
    localStorage.setItem(key, String(cents));
    setGoalCents(cents);
    setInputOpen(false);
    setInputValue('');
  }

  const pct = goalCents > 0 ? Math.min(100, Math.round((Math.max(0, savedCents) / goalCents) * 100)) : 0;
  const isOnTrack = savedCents >= goalCents && goalCents > 0;
  const isOverGoal = savedCents < 0;

  const color =
    isOverGoal ? '#ef4444' :
    isOnTrack ? '#10b981' :
    pct >= 50 ? '#f59e0b' :
    '#f97316';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Target economii
          </h3>
        </div>
        <button
          onClick={() => {
            setInputValue(goalCents > 0 ? (goalCents / 100).toString() : '');
            setInputOpen(!inputOpen);
          }}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {goalCents > 0 ? 'Modifică' : 'Setează target'}
        </button>
      </div>

      {inputOpen && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ex: 1000"
            min="0"
            step="0.01"
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            OK
          </button>
        </div>
      )}

      {goalCents > 0 ? (
        <>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-lg font-bold tabular-nums" style={{ color }}>
              {formatCents(Math.max(0, savedCents))}
            </span>
            <span className="text-xs text-gray-400 mb-0.5">/ {formatCents(goalCents)} RON</span>
          </div>

          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-2">
            {isOnTrack
              ? `Target atins! Ai economisit ${formatCents(savedCents - goalCents)} RON în plus`
              : isOverGoal
                ? 'Cheltuieli peste venituri - revizuiește bugetul'
                : `Mai ai de economisit ${formatCents(goalCents - Math.max(0, savedCents))} RON (${pct}%)`
            }
          </p>
        </>
      ) : (
        <p className="text-xs text-gray-400">
          Setează un target lunar pentru a urmări progresul economiilor
        </p>
      )}
    </div>
  );
}
