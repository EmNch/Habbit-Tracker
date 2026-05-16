'use client';

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatCents } from '@/lib/utils/format';
import type { DailySpending } from '@/lib/types';

interface CumulativeChartProps {
  data: DailySpending[];
  monthlyLimitCents: number;
  daysInMonth: number;
}

export function CumulativeChart({ data, monthlyLimitCents, daysInMonth }: CumulativeChartProps) {
  if (data.length === 0 || data.every((d) => d.amount_cents === 0)) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Ritm cumulativ
        </h3>
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Nicio cheltuială înregistrată
        </div>
      </div>
    );
  }

  let cumulative = 0;
  const chartData = data.map((d) => {
    cumulative += d.amount_cents;
    return {
      day: d.day,
      cheltuit: cumulative,
    };
  });

  const idealDaily = monthlyLimitCents > 0 ? monthlyLimitCents / daysInMonth : 0;

  const budgetLine = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    buget: Math.round(idealDaily * (i + 1)),
  }));

  const merged = chartData.map((d) => {
    const budgetPt = budgetLine.find((b) => b.day === d.day);
    return { ...d, buget: budgetPt?.buget ?? 0 };
  });

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Ritm cumulativ
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-indigo-500 rounded" />
            <span className="text-[10px] text-gray-400">Real</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-400 rounded" style={{ borderTop: '2px dashed', height: 0 }} />
            <span className="text-[10px] text-gray-400">Planificat</span>
          </div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged}>
            <defs>
              <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `${Math.round(v / 100)}`} />
            <Tooltip
              formatter={(value) => [`${formatCents(Number(value))} RON`]}
              labelFormatter={(label) => `Ziua ${label}`}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
            {monthlyLimitCents > 0 && (
              <ReferenceLine
                y={monthlyLimitCents}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: 'Limita', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="buget"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cheltuit"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 2, fill: '#6366f1' }}
              fill="url(#cumulGrad)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
