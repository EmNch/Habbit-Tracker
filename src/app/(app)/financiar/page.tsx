import { getFinancialSummary, getFinancialEntries, getSavingsGoals } from '@/lib/actions/financial';
import { FinancialClient } from '@/components/financial/financial-client';

export default async function FinanciarPage() {
  const [summary, incomeEntries, expenseEntries, savingsEntries, savingsGoals] = await Promise.all([
    getFinancialSummary(),
    getFinancialEntries('income', 50),
    getFinancialEntries('expense', 50),
    getFinancialEntries('saving', 50),
    getSavingsGoals(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stare Financiară
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Sold, venituri, cheltuieli, economii și datorii
        </p>
      </div>

      <FinancialClient
        summary={summary}
        incomeEntries={incomeEntries}
        expenseEntries={expenseEntries}
        savingsEntries={savingsEntries}
        savingsGoals={savingsGoals}
      />
    </div>
  );
}
