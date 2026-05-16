'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ro } from 'date-fns/locale';

interface MonthNavigatorProps {
  currentMonth?: string;
  onNavigate: (yearMonth: string) => void;
}

export function MonthNavigator({ currentMonth, onNavigate }: MonthNavigatorProps) {
  const date = currentMonth ? new Date(currentMonth + '-01') : new Date();
  const label = format(date, 'MMMM yyyy', { locale: ro });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  const now = new Date();
  const isCurrentMonth = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();

  function prev() {
    const p = subMonths(date, 1);
    onNavigate(format(p, 'yyyy-MM'));
  }

  function next() {
    const n = addMonths(date, 1);
    onNavigate(format(n, 'yyyy-MM'));
  }

  function goToCurrent() {
    onNavigate(format(now, 'yyyy-MM'));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <ChevronLeft className="w-5 h-5 text-gray-500" />
      </button>
      <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[130px] text-center capitalize">
        {capitalizedLabel}
      </span>
      <button
        onClick={next}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>
      {!isCurrentMonth && (
        <button
          onClick={goToCurrent}
          className="ml-2 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
        >
          Luna curentă
        </button>
      )}
    </div>
  );
}
