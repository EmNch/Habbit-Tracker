import { getBudgetSummary, getCategories, getRecentTransactions } from '@/lib/actions/budgets';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export default async function BudgetsPage() {
  const [summary, categories, transactions] = await Promise.all([
    getBudgetSummary(),
    getCategories(),
    getRecentTransactions(),
  ]);

  return <BudgetsClient summary={summary} categories={categories} transactions={transactions} />;
}
