'use client';

import { useState, useEffect } from 'react';
import { Archive, RotateCcw } from 'lucide-react';
import { reactivateHabit } from '@/lib/actions/habits';
import type { Habit } from '@/lib/types';

interface ArchivedHabitsProps {
  habits: Habit[];
}

export function ArchivedHabits({ habits }: ArchivedHabitsProps) {
  const [expanded, setExpanded] = useState(false);
  const [list, setList] = useState(habits);

  useEffect(() => {
    setList(habits);
    if (habits.length === 0) setExpanded(false);
  }, [habits]);

  async function handleReactivate(id: string) {
    try {
      await reactivateHabit(id);
      setList((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // keep item in list on failure
    }
  }

  if (list.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        <Archive className="w-4 h-4" />
        {expanded ? 'Ascunde' : 'Obiceiuri dezactivate'} ({list.length})
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {list.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl px-4 py-3 opacity-60"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{habit.icon}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 line-through">
                  {habit.name}
                </span>
              </div>
              <button
                onClick={() => handleReactivate(habit.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reactivează
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
