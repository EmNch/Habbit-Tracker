'use client';

import { cn } from '@/lib/utils/cn';

export type DateRange = '7d' | '30d' | '90d' | 'all';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const OPTIONS: { key: DateRange; label: string }[] = [
  { key: '7d', label: '7z' },
  { key: '30d', label: '30z' },
  { key: '90d', label: '90z' },
  { key: 'all', label: 'Tot' },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition',
            value === opt.key
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function dateRangeToDates(range: DateRange): { start: string; end: string } {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  if (range === 'all') {
    return { start: '2020-01-01', end: end.toLocaleDateString('sv-SE') };
  }

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);

  return { start: start.toLocaleDateString('sv-SE'), end: end.toLocaleDateString('sv-SE') };
}
