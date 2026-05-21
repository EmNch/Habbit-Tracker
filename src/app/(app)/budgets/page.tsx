import { getBudgetSummary, getRecentTransactions, getMonthlyTrends, getDailySpending, getTotalBalance, getRecurringTemplates, processRecurringTransactions } from '@/lib/actions/budgets';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const yearMonth = month || undefined;

  const [summary, transactions, trends, dailySpending, totalBalance, recurringTemplates] = await Promise.all([
    getBudgetSummary(yearMonth),
    getRecentTransactions(yearMonth),
    getMonthlyTrends(),
    getDailySpending(yearMonth),
    getTotalBalance(),
    getRecurringTemplates(),
  ]);

  // Extract categories from summary (avoids redundant getCategories() query)
  const categories = summary.categories.map((cb) => cb.category);

  // Process recurring transactions off the critical render path
  processRecurringTransactions(yearMonth).catch(() => {});

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
