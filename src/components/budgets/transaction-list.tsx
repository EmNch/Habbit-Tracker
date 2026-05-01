'use client';

import { Trash2 } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import { deleteTransaction } from '@/lib/actions/budgets';
import type { TransactionWithCategory } from '@/lib/types';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TransactionListProps {
  transactions: TransactionWithCategory[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">Nicio tranzactie inregistrata</p>
      </div>
    );
  }

  // Group by date
  const grouped = new Map<string, TransactionWithCategory[]>();
  for (const t of transactions) {
    const key = t.transaction_date;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Tranzactii recente
      </h2>

      {[...grouped.entries()].map(([date, items]) => (
        <div key={date}>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {formatDateLabel(date)}
          </p>
          <div className="space-y-1">
            {items.map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionRow({ transaction: t }: { transaction: TransactionWithCategory }) {
  const isExpense = t.kind === 'expense';

  async function handleDelete() {
    await deleteTransaction(t.id);
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/50 group">
      <span className="text-lg flex-shrink-0">{t.category?.icon || '📦'}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white truncate">
          {t.category?.name || 'Necunoscut'}
        </p>
        {t.note && (
          <p className="text-xs text-gray-400 truncate">{t.note}</p>
        )}
      </div>

      <span className={`text-sm font-medium tabular-nums flex-shrink-0 ${
        isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
      }`}>
        {isExpense ? '-' : '+'}{formatCents(t.amount_cents)} RON
      </span>

      <button
        onClick={handleDelete}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = today.toLocaleDateString('sv-SE');
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('sv-SE');

  if (dateStr === todayStr) return 'Azi';
  if (dateStr === yesterdayStr) return 'Ieri';
  return format(d, 'd MMM', { locale: ro });
}
