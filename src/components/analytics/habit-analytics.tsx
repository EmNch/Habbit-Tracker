'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { DateRangeSelector, DateRange, dateRangeToDates } from './date-range-selector';
import { FieldMetrics } from './field-metrics';
import { getEntries } from '@/lib/actions/entries';

const FieldChart = dynamic(() => import('./field-chart').then((m) => ({ default: m.FieldChart })), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Se incarca graficul...
      </div>
    </div>
  ),
});
import type { HabitFieldDefinition, HabitEntry } from '@/lib/types';

interface HabitAnalyticsProps {
  habitId: string;
  fields: HabitFieldDefinition[];
}

const CHARTABLE = new Set(['number', 'slider', 'rating', 'boolean', 'select', 'time_duration']);
const RANGE_DAYS: Record<DateRange, number> = { '7d': 7, '30d': 30, '90d': 90, all: 9999 };

/** Fill missing days in [start, end] with synthetic entries defaulting to 0/false. */
function padEntriesWithDefaults(
  entries: HabitEntry[],
  start: string,
  end: string,
  fields: HabitFieldDefinition[],
): HabitEntry[] {
  const byDate = new Map(entries.map((e) => [e.entry_date, e]));

  const defaults: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.field_type === 'boolean') defaults[f.field_key] = false;
    else if (f.field_type === 'number' || f.field_type === 'slider' || f.field_type === 'time_duration')
      defaults[f.field_key] = 0;
  }

  const padded: HabitEntry[] = [];
  const cur = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  while (cur <= endDate) {
    const dateStr = cur.toLocaleDateString('sv-SE');
    const existing = byDate.get(dateStr);
    if (existing) {
      padded.push(existing);
    } else {
      padded.push({
        id: '',
        habit_id: entries[0]?.habit_id ?? '',
        user_id: entries[0]?.user_id ?? '',
        entry_date: dateStr,
        values: { ...defaults },
        is_completed: false,
        created_at: '',
      } as HabitEntry);
    }
    cur.setDate(cur.getDate() + 1);
  }

  return padded;
}

export function HabitAnalytics({ habitId, fields }: HabitAnalyticsProps) {
  const [range, setRange] = useState<DateRange>('30d');
  const [rawEntries, setRawEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { start, end } = dateRangeToDates(range);
    const data = await getEntries(habitId, start, end);
    setRawEntries(data);
    setLoading(false);
  }, [habitId, range]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const { start, end } = dateRangeToDates(range);

  const entries = useMemo(
    () => padEntriesWithDefaults(rawEntries, start, end, fields),
    [rawEntries, start, end, fields],
  );

  const chartableFields = fields.filter((f) => !f.is_deleted && CHARTABLE.has(f.field_type));

  if (chartableFields.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        Nicio metrica de afisat pentru acest obicei
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DateRangeSelector value={range} onChange={setRange} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        chartableFields.map((field) => (
          <div key={field.id} className="space-y-3">
            <FieldMetrics
              field={field}
              entries={entries}
              daysInRange={RANGE_DAYS[range]}
            />
            <FieldChart field={field} entries={entries} />
          </div>
        ))
      )}
    </div>
  );
}
