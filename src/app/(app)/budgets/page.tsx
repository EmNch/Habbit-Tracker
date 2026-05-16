import { getBudgetSummary, getCategories, getRecentTransactions, getMonthlyTrends, getDailySpending, getTotalBalance, getRecurringTemplates, processRecurringTransactions } from '@/lib/actions/budgets';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const yearMonth = month || undefined;

  const [summary, categories, transactions, trends, dailySpending, totalBalance, recurringTemplates] = await Promise.all([
    getBudgetSummary(yearMonth),
    getCategories(),
    getRecentTransactions(yearMonth),
    getMonthlyTrends(),
    getDailySpending(yearMonth),
    getTotalBalance(),
    getRecurringTemplates(),
    processRecurringTransactions(yearMonth),
  ]);

  return (
    <BudgetsClient
      summary={summary}
      categories={categories}
      transactions={transactions}
      trends={trends}
      dailySpending={dailySpending}
      totalBalance={totalBalance}
      recurringTemplates={recurringTemplates}
      currentMonth={yearMonth}
    />
  );
}
