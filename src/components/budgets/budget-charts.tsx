'use client';

import dynamic from 'next/dynamic';
import type { CategoryBudget, MonthlyTrend, DailySpending } from '@/lib/types';

const ExpensePieChart = dynamic(() => import('./expense-pie-chart').then((m) => ({ default: m.ExpensePieChart })), { ssr: false });
const IncomeExpenseChart = dynamic(() => import('./income-expense-chart').then((m) => ({ default: m.IncomeExpenseChart })), { ssr: false });
const DailySpendingChart = dynamic(() => import('./daily-spending-chart').then((m) => ({ default: m.DailySpendingChart })), { ssr: false });
const CumulativeChart = dynamic(() => import('./cumulative-chart').then((m) => ({ default: m.CumulativeChart })), { ssr: false });

interface BudgetChartsProps {
  budgets: CategoryBudget[];
  trends: MonthlyTrend[];
  dailySpending: DailySpending[];
  dailyBudgetCents: number;
  monthlyLimitCents: number;
  daysInMonth: number;
}

export function BudgetCharts({ budgets, trends, dailySpending, dailyBudgetCents, monthlyLimitCents, daysInMonth }: BudgetChartsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Analiză & Grafice
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ExpensePieChart budgets={budgets} />
        <IncomeExpenseChart trends={trends} />
        <CumulativeChart data={dailySpending} monthlyLimitCents={monthlyLimitCents} daysInMonth={daysInMonth} />
        <DailySpendingChart data={dailySpending} dailyBudgetCents={dailyBudgetCents} />
      </div>
    </div>
  );
}
