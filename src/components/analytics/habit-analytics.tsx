'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { DateRangeSelector, DateRange, dateRangeToDates } from './date-range-selector';
import { FieldMetrics } from './field-metrics';
import { FieldChart } from './field-chart';
import { getEntries } from '@/lib/actions/entries';
import type { HabitFieldDefinition, HabitEntry } from '@/lib/types';

interface HabitAnalyticsProps {
  habitId: string;
  fields: HabitFieldDefinition[];
}

const CHARTABLE = new Set(['number', 'slider', 'rating', 'boolean', 'select', 'time_duration']);
const RANGE_DAYS: Record<DateRange, number> = { '7d': 7, '30d': 30, '90d': 90, all: 9999 };

export function HabitAnalytics({ habitId, fields }: HabitAnalyticsProps) {
  const [range, setRange] = useState<DateRange>('30d');
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { start, end } = dateRangeToDates(range);
    const data = await getEntries(habitId, start, end);
    setEntries(data);
    setLoading(false);
  }, [habitId, range]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

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
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">
          Nicio inregistrare in acest interval
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
