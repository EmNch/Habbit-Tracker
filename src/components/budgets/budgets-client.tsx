'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BudgetSummaryCard } from './budget-summary-card';
import { CategoryProgress } from './category-progress';
import { TransactionList } from './transaction-list';
import { BudgetCharts } from './budget-charts';
import { BudgetInsights } from './budget-insights';
import { SavingsRateCard } from './savings-rate-card';
import { BudgetAllocationCard } from './budget-allocation-card';
import { TotalBalanceCard } from './total-balance-card';
import { HealthScoreCard } from './health-score';
import { SavingsGoal } from './savings-goal';
import { QuickStats } from './quick-stats';
import { MonthComparison } from './month-comparison';
import { RecurringSection } from './recurring-section';
import { ExportButton } from './export-button';
import { MonthNavigator } from './month-navigator';
import { AddTransactionSheet } from './add-transaction-sheet';
import { AddCategorySheet } from './add-category-sheet';
import { EditTransactionSheet } from './edit-transaction-sheet';
import { EditCategorySheet } from './edit-category-sheet';
import { AddRecurringSheet } from './add-recurring-sheet';
import type {
  BudgetSummary,
  BudgetCategory,
  TransactionWithCategory,
  MonthlyTrend,
  DailySpending,
  RecurringTemplateWithCategory,
} from '@/lib/types';

interface TotalBalance {
  income: number;
  expense: number;
  balance: number;
}

interface BudgetsClientProps {
  summary: BudgetSummary;
  categories: BudgetCategory[];
  transactions: TransactionWithCategory[];
  trends: MonthlyTrend[];
  dailySpending: DailySpending[];
  totalBalance: TotalBalance;
  recurringTemplates: RecurringTemplateWithCategory[];
  currentMonth?: string;
}

export function BudgetsClient({
  summary,
  categories,
  transactions,
  trends,
  dailySpending,
  totalBalance,
  recurringTemplates,
  currentMonth,
}: BudgetsClientProps) {
  const router = useRouter();
  const [txSheetOpen, setTxSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [recurringSheetOpen, setRecurringSheetOpen] = useState(false);
  const [editTx, setEditTx] = useState<TransactionWithCategory | null>(null);
  const [editCat, setEditCat] = useState<BudgetCategory | null>(null);

  function navigate(yearMonth: string) {
    router.push(`/budgets?month=${yearMonth}`);
  }

  function refresh() {
    router.refresh();
  }

  function handleEditTxClose() {
    setEditTx(null);
    refresh();
  }

  function handleEditCatClose() {
    setEditCat(null);
    refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bugete
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Trasează-ți cheltuielile și veniturile
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton yearMonth={currentMonth} />
          <button
            onClick={() => setTxSheetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Tranzacție
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="mb-6">
        <MonthNavigator currentMonth={currentMonth} onNavigate={navigate} />
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Summary Cards */}
        <BudgetSummaryCard summary={summary} />

        {/* Health Score + Savings Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <HealthScoreCard summary={summary} />
          <SavingsGoal
            savedCents={summary.total_income_cents - summary.total_expense_cents}
            yearMonth={currentMonth}
          />
        </div>

        {/* Month Comparison */}
        <MonthComparison trends={trends} />

        {/* Insights */}
        <BudgetInsights insights={summary.insights} />

        {/* Quick Stats */}
        <QuickStats
          transactions={transactions}
          daysElapsed={summary.overview.days_elapsed}
        />

        {/* Planning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SavingsRateCard
            incomeCents={summary.total_income_cents}
            expenseCents={summary.total_expense_cents}
          />
          <BudgetAllocationCard
            budgets={summary.categories}
            totalIncomeCents={summary.total_income_cents}
          />
        </div>

        {/* Charts */}
        <BudgetCharts
          budgets={summary.categories}
          trends={trends}
          dailySpending={dailySpending}
          dailyBudgetCents={summary.overview.daily_budget_cents}
          monthlyLimitCents={summary.overview.total_planned_cents}
          daysInMonth={summary.overview.days_in_month}
        />

        {/* Recurring */}
        <RecurringSection
          templates={recurringTemplates}
          onAdd={() => setRecurringSheetOpen(true)}
          onChanged={refresh}
        />

        {/* Category Progress */}
        <CategoryProgress
          budgets={summary.categories}
          onAddCategory={() => setCatSheetOpen(true)}
          onEditCategory={(cat) => setEditCat(cat)}
        />

        {/* Total Balance */}
        <TotalBalanceCard {...totalBalance} />

        {/* Transactions */}
        <TransactionList
          transactions={transactions}
          categories={categories}
          onEdit={(tx) => setEditTx(tx)}
          onDeleted={refresh}
        />
      </div>

      {/* Sheets */}
      <AddTransactionSheet
        open={txSheetOpen}
        onClose={() => { setTxSheetOpen(false); refresh(); }}
        categories={categories}
      />

      <AddCategorySheet
        open={catSheetOpen}
        onClose={() => { setCatSheetOpen(false); refresh(); }}
      />

      <AddRecurringSheet
        open={recurringSheetOpen}
        onClose={() => { setRecurringSheetOpen(false); refresh(); }}
        categories={categories}
      />

      {editTx && (
        <EditTransactionSheet
          open={!!editTx}
          onClose={handleEditTxClose}
          transaction={editTx}
          categories={categories}
        />
      )}

      {editCat && (
        <EditCategorySheet
          open={!!editCat}
          onClose={handleEditCatClose}
          category={editCat}
        />
      )}
    </div>
  );
}
