'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatCents } from '@/lib/utils/format';
import type { MonthlyTrend } from '@/lib/types';

interface IncomeExpenseChartProps {
  trends: MonthlyTrend[];
}

const MONTH_ABBR = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function IncomeExpenseChart({ trends }: IncomeExpenseChartProps) {
  if (trends.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Venituri vs Cheltuieli
        </h3>
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Nu sunt date suficiente
        </div>
      </div>
    );
  }

  const data = trends.map((t) => {
    const monthIdx = parseInt(t.month.split('-')[1], 10) - 1;
    return {
      label: MONTH_ABBR[monthIdx],
      Venituri: t.income_cents,
      Cheltuieli: t.expense_cents,
    };
  });

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Venituri vs Cheltuieli
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `${Math.round(v / 100)}`} />
            <Tooltip
              formatter={(value, name) => [`${formatCents(Number(value))} RON`, String(name)]}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
            <Bar dataKey="Venituri" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cheltuieli" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
