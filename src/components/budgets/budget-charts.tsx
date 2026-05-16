'use client';

import { ExpensePieChart } from './expense-pie-chart';
import { IncomeExpenseChart } from './income-expense-chart';
import { DailySpendingChart } from './daily-spending-chart';
import { CumulativeChart } from './cumulative-chart';
import type { CategoryBudget, MonthlyTrend, DailySpending } from '@/lib/types';

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
