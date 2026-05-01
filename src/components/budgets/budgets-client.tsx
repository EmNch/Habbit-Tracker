'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BudgetSummaryCard } from './budget-summary-card';
import { CategoryProgress } from './category-progress';
import { TransactionList } from './transaction-list';
import { AddTransactionSheet } from './add-transaction-sheet';
import { AddCategorySheet } from './add-category-sheet';
import type { BudgetSummary, BudgetCategory, TransactionWithCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface BudgetsClientProps {
  summary: BudgetSummary;
  categories: BudgetCategory[];
  transactions: TransactionWithCategory[];
}

export function BudgetsClient({ summary, categories, transactions }: BudgetsClientProps) {
  const router = useRouter();
  const [txSheetOpen, setTxSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);

  function refresh() {
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bugete
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Traseaza-ti cheltuielile si veniturile
          </p>
        </div>
        <button
          onClick={() => setTxSheetOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Tranzactie
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        <BudgetSummaryCard summary={summary} />
        <CategoryProgress budgets={summary.categories} onAddCategory={() => setCatSheetOpen(true)} />
        <TransactionList transactions={transactions} />
      </div>

      <AddTransactionSheet
        open={txSheetOpen}
        onClose={() => { setTxSheetOpen(false); refresh(); }}
        categories={categories}
      />

      <AddCategorySheet
        open={catSheetOpen}
        onClose={() => { setCatSheetOpen(false); refresh(); }}
      />
    </div>
  );
}
