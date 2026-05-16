'use client';

import { useState, useMemo } from 'react';
import { Trash2, Pencil, Search, X } from 'lucide-react';
import { formatCents } from '@/lib/utils/format';
import { deleteTransaction } from '@/lib/actions/budgets';
import type { TransactionWithCategory, BudgetCategory } from '@/lib/types';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  categories: BudgetCategory[];
  onEdit: (transaction: TransactionWithCategory) => void;
}

export function TransactionList({ transactions, categories, onEdit }: TransactionListProps) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const expenseCategories = categories.filter((c) => c.kind === 'expense');
  const incomeCategories = categories.filter((c) => c.kind === 'income');

  const filtered = useMemo(() => {
    let result = transactions;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.category?.name && t.category.name.toLowerCase().includes(q))
      );
    }

    if (filterCat !== 'all') {
      result = result.filter((t) => t.category_id === filterCat);
    }

    return result;
  }, [transactions, search, filterCat]);

  const hasActiveFilter = search.trim() !== '' || filterCat !== 'all';

  function clearFilters() {
    setSearch('');
    setFilterCat('all');
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">Nicio tranzacție înregistrată</p>
      </div>
    );
  }

  const grouped = new Map<string, TransactionWithCategory[]>();
  for (const t of filtered) {
    const key = t.transaction_date;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Tranzacții{hasActiveFilter ? ` (${filtered.length})` : ''}
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-1.5 rounded-lg transition ${
            showFilters || hasActiveFilter
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
          }`}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {showFilters && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după nume sau notă..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                filterCat === 'all'
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Toate
            </button>
            {expenseCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                  filterCat === cat.id
                    ? 'ring-1 ring-offset-1 bg-gray-50 dark:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                style={filterCat === cat.id ? { '--tw-ring-color': cat.color } as React.CSSProperties : {}}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
            {incomeCategories.length > 0 && incomeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                  filterCat === cat.id
                    ? 'ring-1 ring-offset-1 bg-gray-50 dark:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                style={filterCat === cat.id ? { '--tw-ring-color': cat.color } as React.CSSProperties : {}}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-3 h-3" />
              Șterge filtre
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 && hasActiveFilter ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">Nicio tranzacție găsită</p>
        </div>
      ) : (
        [...grouped.entries()].map(([date, items]) => (
          <div key={date}>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              {formatDateLabel(date)}
            </p>
            <div className="space-y-1">
              {items.map((t) => (
                <TransactionRow key={t.id} transaction={t} onEdit={onEdit} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TransactionRow({
  transaction: t,
  onEdit,
}: {
  transaction: TransactionWithCategory;
  onEdit: (t: TransactionWithCategory) => void;
}) {
  const isExpense = t.kind === 'expense';

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await deleteTransaction(t.id);
    window.location.reload();
  }

  return (
    <div
      onClick={() => onEdit(t)}
      className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/50 group cursor-pointer hover:border-gray-200 dark:hover:border-gray-600 transition"
    >
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

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(t); }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-300 hover:text-indigo-500 transition"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
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
