'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatCents } from '@/lib/utils/format';
import type { DailySpending } from '@/lib/types';

interface DailySpendingChartProps {
  data: DailySpending[];
  dailyBudgetCents: number;
}

export function DailySpendingChart({ data, dailyBudgetCents }: DailySpendingChartProps) {
  if (data.length === 0 || data.every((d) => d.amount_cents === 0)) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Cheltuieli zilnice
        </h3>
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Nicio cheltuială înregistrată
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    day: d.day,
    sumă: d.amount_cents,
  }));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:col-span-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Cheltuieli zilnice
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `${Math.round(v / 100)}`} />
            <Tooltip
              formatter={(value) => [`${formatCents(Number(value))} RON`, 'Sumă']}
              labelFormatter={(label) => `Ziua ${label}`}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
            {dailyBudgetCents > 0 && (
              <ReferenceLine
                y={dailyBudgetCents}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Target', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="sumă"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#spendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
