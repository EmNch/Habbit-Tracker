'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  BudgetCategory,
  Transaction,
  TransactionWithCategory,
  CategoryBudget,
  BudgetSummary,
  BudgetCategoryKind,
} from '@/lib/types';

// ── Helpers ──

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return {
    start: start.toLocaleDateString('sv-SE'),
    end: end.toLocaleDateString('sv-SE'),
  };
}

function getCategoryStatus(spentCents: number, limitCents: number | null): CategoryBudget['status'] {
  if (!limitCents) return 'normal';
  const pct = (spentCents / limitCents) * 100;
  if (pct >= 100) return 'danger';
  if (pct >= 80) return 'warning';
  if (pct >= 50) return 'normal';
  return 'safe';
}

// ── Categories ──

export async function getCategories(): Promise<BudgetCategory[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (data as BudgetCategory[]) ?? [];
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const icon = (formData.get('icon') as string) || '📦';
  const color = (formData.get('color') as string) || '#6366f1';
  const kind = formData.get('kind') as BudgetCategoryKind;
  const monthlyLimitCents = formData.get('monthly_limit_cents')
    ? Math.round(Number(formData.get('monthly_limit_cents')) * 100)
    : null;

  const { error } = await supabase
    .from('budget_categories')
    .insert({
      user_id: user.user.id,
      name,
      icon,
      color,
      kind,
      monthly_limit_cents: kind === 'expense' ? monthlyLimitCents : null,
    });

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('budget_categories')
    .update({ is_active: false })
    .eq('id', categoryId);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

// ── Transactions ──

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const categoryId = formData.get('category_id') as string;
  const amountCents = Math.round(Number(formData.get('amount_cents')));
  const kind = formData.get('kind') as BudgetCategoryKind;
  const note = (formData.get('note') as string) || '';
  const date = (formData.get('transaction_date') as string) || new Date().toLocaleDateString('sv-SE');

  if (!categoryId || amountCents <= 0) {
    return { error: 'Date invalide' };
  }

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.user.id,
      category_id: categoryId,
      amount_cents: amountCents,
      kind,
      note,
      transaction_date: date,
    });

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function getRecentTransactions(limit = 20): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('transactions')
    .select('*, category:budget_categories(*)')
    .eq('user_id', user.user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data as unknown as TransactionWithCategory[]) ?? [];
}

// ── Budget Summary ──

export async function getBudgetSummary(yearMonth?: string): Promise<BudgetSummary> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return { total_income_cents: 0, total_expense_cents: 0, balance_cents: 0, categories: [] };
  }

  const date = yearMonth ? new Date(yearMonth + '-01') : new Date();
  const { start, end } = getMonthRange(date);

  const [catsResult, transResult] = await Promise.all([
    supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('transactions')
      .select('category_id, amount_cents, kind')
      .eq('user_id', user.user.id)
      .gte('transaction_date', start)
      .lt('transaction_date', end),
  ]);

  const categories = (catsResult.data as BudgetCategory[]) ?? [];
  const transactions = transResult.data ?? [];

  // Sum per category
  const spentByCategory = new Map<string, number>();
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    const key = t.category_id as string;
    const amount = t.amount_cents as number;
    spentByCategory.set(key, (spentByCategory.get(key) || 0) + amount);
    if (t.kind === 'income') totalIncome += amount;
    else totalExpense += amount;
  }

  const categoryBudgets: CategoryBudget[] = categories.map((cat) => {
    const spent = spentByCategory.get(cat.id) || 0;
    return {
      category: cat,
      spent_cents: spent,
      limit_cents: cat.monthly_limit_cents,
      percent: cat.monthly_limit_cents ? Math.round((spent / cat.monthly_limit_cents) * 100) : 0,
      status: getCategoryStatus(spent, cat.monthly_limit_cents),
    };
  });

  return {
    total_income_cents: totalIncome,
    total_expense_cents: totalExpense,
    balance_cents: totalIncome - totalExpense,
    categories: categoryBudgets,
  };
}

// ── Format helpers (client-side) ──
// Moved to src/lib/utils/format.ts to avoid 'use server' boundary issues
