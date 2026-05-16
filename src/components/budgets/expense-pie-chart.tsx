'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCents } from '@/lib/utils/format';
import type { CategoryBudget } from '@/lib/types';

interface ExpensePieChartProps {
  budgets: CategoryBudget[];
}

export function ExpensePieChart({ budgets }: ExpensePieChartProps) {
  const data = budgets
    .filter((b) => b.category.kind === 'expense' && b.spent_cents > 0)
    .map((b) => ({
      name: b.category.name,
      value: b.spent_cents,
      color: b.category.color,
      icon: b.category.icon,
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Distribuție cheltuieli
        </h3>
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Nicio cheltuială înregistrată
        </div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Distribuție cheltuieli
      </h3>
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${formatCents(Number(value))} RON`, '']}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {formatCents(total)}
            </p>
            <p className="text-[10px] text-gray-400">RON</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
