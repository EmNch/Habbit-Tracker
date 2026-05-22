'use client';

import { useState } from 'react';
import type { FinancialEntry, FinancialSummary, SavingGoal } from '@/lib/types';
import { SoldSection } from './sold-section';
import { IncomeSection } from './income-section';
import { ExpenseSection } from './expense-section';
import { SavingsSection } from './savings-section';
import { DebtsSection } from './debts-section';

type Tab = 'sold' | 'venituri' | 'cheltuieli' | 'economii' | 'datorii';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'sold', label: 'Sold', icon: '💰' },
  { key: 'venituri', label: 'Venituri', icon: '📈' },
  { key: 'cheltuieli', label: 'Cheltuieli', icon: '📉' },
  { key: 'economii', label: 'Economii', icon: '🏦' },
  { key: 'datorii', label: 'Datorii', icon: '⚠️' },
];

interface FinancialClientProps {
  summary: FinancialSummary;
  incomeEntries: FinancialEntry[];
  expenseEntries: FinancialEntry[];
  savingsEntries: FinancialEntry[];
  savingsGoals: SavingGoal[];
}

export function FinancialClient({
  summary,
  incomeEntries,
  expenseEntries,
  savingsEntries,
  savingsGoals,
}: FinancialClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sold');

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 -mx-1 px-1 snap-x snap-mandatory">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap snap-start ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'sold' && <SoldSection summary={summary} />}
        {activeTab === 'venituri' && <IncomeSection entries={incomeEntries} />}
        {activeTab === 'cheltuieli' && <ExpenseSection entries={expenseEntries} />}
        {activeTab === 'economii' && <SavingsSection goals={savingsGoals} savingsEntries={savingsEntries} />}
        {activeTab === 'datorii' && <DebtsSection debtSummary={summary.debtSummary} />}
      </div>
    </div>
  );
}
