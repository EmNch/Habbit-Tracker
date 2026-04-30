'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { FieldType, HabitFieldDefinition, HabitEntry } from '@/lib/types';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

interface FieldChartProps {
  field: HabitFieldDefinition;
  entries: HabitEntry[];
}

export function FieldChart({ field, entries }: FieldChartProps) {
  const fieldType = field.field_type;

  if (!CHARTABLE_TYPES.has(fieldType)) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {field.field_label}
      </h3>
      <div className="h-48">
        {fieldType === 'number' || fieldType === 'slider' ? (
          <LineChartComponent field={field} entries={entries} />
        ) : fieldType === 'rating' ? (
          <BarChartComponent field={field} entries={entries} />
        ) : fieldType === 'boolean' ? (
          <PieChartComponent field={field} entries={entries} />
        ) : fieldType === 'select' ? (
          <PieChartSelectComponent field={field} entries={entries} />
        ) : null}
      </div>
    </div>
  );
}

const CHARTABLE_TYPES = new Set<FieldType>(['number', 'slider', 'rating', 'boolean', 'select']);

function LineChartComponent({ field, entries }: FieldChartProps) {
  const data = entries
    .filter((e) => e.values[field.field_key] != null)
    .map((e) => ({
      date: e.entry_date.slice(5),
      value: Number(e.values[field.field_key]),
    }));

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3, fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartComponent({ field, entries }: FieldChartProps) {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  entries.forEach((e) => {
    const val = Number(e.values[field.field_key]);
    if (val >= 1 && val <= 5) {
      distribution[val]++;
    }
  });

  const data = Object.entries(distribution).map(([key, count]) => ({
    rating: `${key} stea${Number(key) > 1 ? 'le' : ''}`,
    count,
  }));

  if (data.every((d) => d.count === 0)) {
    return <EmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="rating" tick={{ fontSize: 10 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff',
          }}
        />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartComponent({ field, entries }: FieldChartProps) {
  let trueCount = 0;
  let falseCount = 0;

  entries.forEach((e) => {
    const val = e.values[field.field_key];
    if (val === true) trueCount++;
    else if (val === false) falseCount++;
  });

  if (trueCount === 0 && falseCount === 0) {
    return <EmptyState />;
  }

  const data = [
    { name: 'Da', value: trueCount },
    { name: 'Nu', value: falseCount },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          <Cell fill="#6366f1" />
          <Cell fill="#e5e7eb" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PieChartSelectComponent({ field, entries }: FieldChartProps) {
  const distribution: Record<string, number> = {};

  entries.forEach((e) => {
    const val = e.values[field.field_key];
    if (typeof val === 'string' && val) {
      distribution[val] = (distribution[val] || 0) + 1;
    }
  });

  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Nu sunt date suficiente
    </div>
  );
}
