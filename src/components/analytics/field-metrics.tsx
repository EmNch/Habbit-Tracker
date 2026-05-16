'use client';

import { TrendingUp, TrendingDown, Minus, Trophy, Hash, BarChart3, Target, Star, CheckCircle2, List } from 'lucide-react';
import type { HabitFieldDefinition, HabitEntry, FieldType } from '@/lib/types';
import { computeNumberMetrics, computeRatingMetrics, computeBooleanMetrics, computeSelectMetrics } from '@/lib/utils/analytics';

interface FieldMetricsProps {
  field: HabitFieldDefinition;
  entries: HabitEntry[];
  daysInRange: number;
}

export function FieldMetrics({ field, entries, daysInRange }: FieldMetricsProps) {
  const type = field.field_type;

  if (type === 'number' || type === 'slider' || type === 'time_duration') {
    return <NumberFieldMetrics entries={entries} fieldKey={field.field_key} daysInRange={daysInRange} unit={field.field_label.toLowerCase()} />;
  }
  if (type === 'rating') {
    return <RatingFieldMetrics entries={entries} fieldKey={field.field_key} />;
  }
  if (type === 'boolean') {
    return <BooleanFieldMetrics entries={entries} fieldKey={field.field_key} />;
  }
  if (type === 'select') {
    return <SelectFieldMetrics entries={entries} fieldKey={field.field_key} />;
  }

  return null;
}

function NumberFieldMetrics({ entries, fieldKey, daysInRange, unit }: { entries: HabitEntry[]; fieldKey: string; daysInRange: number; unit: string }) {
  const m = computeNumberMetrics(entries, fieldKey, daysInRange);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <MetricCard
        icon={<Hash className="w-3.5 h-3.5" />}
        label="Total"
        value={m.total.toLocaleString('ro-RO')}
        accent
      />
      <MetricCard
        icon={<BarChart3 className="w-3.5 h-3.5" />}
        label={`Medie/${m.daysWithEntry > 0 ? m.daysWithEntry + 'z' : '-'}`}
        value={m.average.toLocaleString('ro-RO')}
      />
      <MetricCard
        icon={<Trophy className="w-3.5 h-3.5" />}
        label="Record"
        value={m.max > 0 ? m.max.toLocaleString('ro-RO') : '-'}
        sub={m.maxDate ? formatDateShort(m.maxDate) : undefined}
      />
      <TrendCard trend={m.trend} />
    </div>
  );
}

function RatingFieldMetrics({ entries, fieldKey }: { entries: HabitEntry[]; fieldKey: string }) {
  const m = computeRatingMetrics(entries, fieldKey);

  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard
        icon={<Star className="w-3.5 h-3.5" />}
        label="Medie"
        value={m.average > 0 ? `${m.average} / 5` : '-'}
        accent
      />
      <MetricCard
        icon={<Target className="w-3.5 h-3.5" />}
        label="Total evaluari"
        value={String(m.totalRatings)}
      />
    </div>
  );
}

function BooleanFieldMetrics({ entries, fieldKey }: { entries: HabitEntry[]; fieldKey: string }) {
  const m = computeBooleanMetrics(entries, fieldKey);

  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard
        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        label="Rata succes"
        value={m.successRate > 0 ? `${m.successRate}%` : '-'}
        accent
      />
      <MetricCard
        icon={<Trophy className="w-3.5 h-3.5" />}
        label="Streak curent"
        value={`${m.currentStreak} ${m.currentStreak === 1 ? 'zi' : 'zile'}`}
      />
    </div>
  );
}

function SelectFieldMetrics({ entries, fieldKey }: { entries: HabitEntry[]; fieldKey: string }) {
  const m = computeSelectMetrics(entries, fieldKey);

  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard
        icon={<List className="w-3.5 h-3.5" />}
        label="Cel mai frecvent"
        value={m.mostCommon || '-'}
        sub={m.mostCommonCount > 0 ? `${m.mostCommonCount}x` : undefined}
        accent
      />
      <MetricCard
        icon={<Target className="w-3.5 h-3.5" />}
        label="Variatii unice"
        value={String(m.uniqueCount)}
      />
    </div>
  );
}

function MetricCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 border ${
      accent
        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={accent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}>{icon}</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-sm font-bold tabular-nums ${
        accent ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'
      }`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function TrendCard({ trend }: { trend: number | null }) {
  const isUp = trend !== null && trend > 0;
  const isDown = trend !== null && trend < 0;
  const isFlat = trend === 0;
  const color = isUp ? 'text-green-600 dark:text-green-400' : isDown ? 'text-red-600 dark:text-red-400' : 'text-gray-400';
  const bg = isUp ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : isDown ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';

  return (
    <div className={`rounded-lg p-3 border ${bg}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {isUp ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> : isDown ? <TrendingDown className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trend</span>
      </div>
      <p className={`text-sm font-bold tabular-nums ${color}`}>
        {trend !== null ? `${trend > 0 ? '+' : ''}${trend}%` : '-'}
      </p>
    </div>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${d.toLocaleDateString('ro-RO', { month: 'short' })}`;
}
