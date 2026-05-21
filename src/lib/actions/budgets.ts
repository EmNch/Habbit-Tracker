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
  MonthlyBudgetOverview,
  BudgetInsight,
  MonthlyTrend,
  DailySpending,
  RecurringTemplate,
  RecurringTemplateWithCategory,
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

function computeOverview(
  categories: BudgetCategory[],
  totalExpense: number,
  totalIncome: number,
  yearMonth?: string,
): MonthlyBudgetOverview {
  const now = new Date();
  const ref = yearMonth ? new Date(yearMonth + '-01') : now;
  const year = ref.getFullYear();
  const month = ref.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysRemaining = Math.max(1, daysInMonth - daysElapsed);

  const totalPlanned = categories
    .filter((c) => c.kind === 'expense' && c.monthly_limit_cents)
    .reduce((sum, c) => sum + (c.monthly_limit_cents || 0), 0);

  const remaining = totalPlanned - totalExpense;
  const dailyBudget = totalPlanned > 0 ? Math.max(0, Math.round(remaining / daysRemaining)) : 0;
  const spendingPercent = totalPlanned > 0 ? Math.round((totalExpense / totalPlanned) * 100) : 0;

  return {
    total_planned_cents: totalPlanned,
    total_spent_cents: totalExpense,
    total_income_cents: totalIncome,
    remaining_cents: remaining,
    daily_budget_cents: dailyBudget,
    spending_percent: spendingPercent,
    days_in_month: daysInMonth,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
  };
}

function computeInsights(
  categoryBudgets: CategoryBudget[],
  daysElapsed: number,
  daysInMonth: number,
): BudgetInsight[] {
  return categoryBudgets
    .filter((cb) => cb.category.kind === 'expense' && cb.limit_cents !== null)
    .map((cb) => {
      const spent = cb.spent_cents;
      const limit = cb.limit_cents!;
      const dailyRate = daysElapsed > 0 ? spent / daysElapsed : 0;
      const projected = Math.round(dailyRate * daysInMonth);
      const projectedOverspend = projected > limit ? projected - limit : 0;

      let daysUntilLimit: number | null = null;
      if (dailyRate > 0 && spent < limit) {
        daysUntilLimit = Math.floor((limit - spent) / dailyRate);
      }

      const pacePercent = limit > 0 ? (dailyRate * daysInMonth) / limit * 100 : 0;
      let severity: BudgetInsight['severity'] = 'ok';
      if (pacePercent >= 120 || spent >= limit) severity = 'critical';
      else if (pacePercent >= 100) severity = 'warning';
      else if (pacePercent >= 80) severity = 'caution';

      return {
        category_id: cb.category.id,
        category_name: cb.category.name,
        category_icon: cb.category.icon,
        projected_overspend_cents: projectedOverspend,
        days_until_limit: daysUntilLimit,
        severity,
      };
    });
}

// ── Categories ──

export async function getCategories(): Promise<BudgetCategory[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('budget_categories')
    .select('id, user_id, name, icon, color, kind, monthly_limit_cents, is_active, sort_order')
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
    ? Math.round(Number(formData.get('monthly_limit_cents')) * 100) || null
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

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const icon = (formData.get('icon') as string) || '📦';
  const color = (formData.get('color') as string) || '#6366f1';
  const monthlyLimitCents = formData.get('monthly_limit_cents')
    ? Math.round(Number(formData.get('monthly_limit_cents')) * 100) || null
    : null;

  const { error } = await supabase
    .from('budget_categories')
    .update({
      name,
      icon,
      color,
      monthly_limit_cents: monthlyLimitCents,
    })
    .eq('id', categoryId)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { error } = await supabase
    .from('budget_categories')
    .update({ is_active: false })
    .eq('id', categoryId)
    .eq('user_id', user.user.id);

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

  if (!categoryId || !Number.isFinite(amountCents) || amountCents <= 0) {
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

export async function updateTransaction(transactionId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const categoryId = formData.get('category_id') as string;
  const amountCents = Math.round(Number(formData.get('amount_cents')));
  const kind = formData.get('kind') as BudgetCategoryKind;
  const note = (formData.get('note') as string) || '';
  const date = (formData.get('transaction_date') as string) || new Date().toLocaleDateString('sv-SE');

  if (!categoryId || !Number.isFinite(amountCents) || amountCents <= 0) {
    return { error: 'Date invalide' };
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      category_id: categoryId,
      amount_cents: amountCents,
      kind,
      note,
      transaction_date: date,
    })
    .eq('id', transactionId)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function getRecentTransactions(yearMonth?: string, limit = 50): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  let query = supabase
    .from('transactions')
    .select('id, category_id, amount_cents, kind, note, transaction_date, category:budget_categories(id, name, icon, color, kind)')
    .eq('user_id', user.user.id);

  if (yearMonth) {
    const date = new Date(yearMonth + '-01');
    const { start, end } = getMonthRange(date);
    query = query.gte('transaction_date', start).lt('transaction_date', end);
  }

  const { data } = await query
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
    return {
      total_income_cents: 0,
      total_expense_cents: 0,
      balance_cents: 0,
      categories: [],
      overview: {
        total_planned_cents: 0,
        total_spent_cents: 0,
        total_income_cents: 0,
        remaining_cents: 0,
        daily_budget_cents: 0,
        spending_percent: 0,
        days_in_month: 30,
        days_elapsed: 1,
        days_remaining: 29,
      },
      insights: [],
    };
  }

  const date = yearMonth ? new Date(yearMonth + '-01') : new Date();
  const { start, end } = getMonthRange(date);

  const [catsResult, transResult] = await Promise.all([
    supabase
      .from('budget_categories')
      .select('id, user_id, name, icon, color, kind, monthly_limit_cents, is_active, sort_order')
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

  const overview = computeOverview(categories, totalExpense, totalIncome, yearMonth);
  const insights = computeInsights(categoryBudgets, overview.days_elapsed, overview.days_in_month);

  return {
    total_income_cents: totalIncome,
    total_expense_cents: totalExpense,
    balance_cents: totalIncome - totalExpense,
    categories: categoryBudgets,
    overview,
    insights,
  };
}

// ── Trends & Analytics ──

export async function getMonthlyTrends(months = 6): Promise<MonthlyTrend[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const startStr = startMonth.toLocaleDateString('sv-SE');

  const { data } = await supabase
    .from('transactions')
    .select('amount_cents, kind, transaction_date')
    .eq('user_id', user.user.id)
    .gte('transaction_date', startStr);

  const byMonth = new Map<string, { income: number; expense: number }>();

  for (let i = 0; i < months; i++) {
    const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(key, { income: 0, expense: 0 });
  }

  for (const t of (data ?? [])) {
    const monthKey = (t.transaction_date as string).slice(0, 7);
    const entry = byMonth.get(monthKey);
    if (entry) {
      if (t.kind === 'income') entry.income += t.amount_cents as number;
      else entry.expense += t.amount_cents as number;
    }
  }

  return [...byMonth.entries()].map(([month, { income, expense }]) => ({
    month,
    income_cents: income,
    expense_cents: expense,
    balance_cents: income - expense,
  }));
}

export async function getDailySpending(yearMonth?: string): Promise<DailySpending[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const date = yearMonth ? new Date(yearMonth + '-01') : new Date();
  const { start, end } = getMonthRange(date);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const { data } = await supabase
    .from('transactions')
    .select('amount_cents, transaction_date')
    .eq('user_id', user.user.id)
    .eq('kind', 'expense')
    .gte('transaction_date', start)
    .lt('transaction_date', end);

  const byDay = new Map<number, number>();
  for (let d = 1; d <= daysInMonth; d++) byDay.set(d, 0);

  for (const t of (data ?? [])) {
    const day = new Date(t.transaction_date + 'T00:00:00').getDate();
    byDay.set(day, (byDay.get(day) || 0) + (t.amount_cents as number));
  }

  return [...byDay.entries()]
    .map(([day, amount]) => ({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day,
      amount_cents: amount,
    }))
    .sort((a, b) => a.day - b.day);
}

export async function getTotalBalance(): Promise<{ income: number; expense: number; balance: number }> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { income: 0, expense: 0, balance: 0 };

  const { data } = await supabase.rpc('get_total_balance', { p_user_id: user.user.id });

  if (!data || data.length === 0) return { income: 0, expense: 0, balance: 0 };

  const row = data[0];
  return {
    income: row.income ?? 0,
    expense: row.expense ?? 0,
    balance: row.balance ?? 0,
  };
}

// ── Recurring Templates ──

export async function getRecurringTemplates(): Promise<RecurringTemplateWithCategory[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('recurring_templates')
    .select('id, category_id, amount_cents, kind, note, day_of_month, is_active, category:budget_categories(id, name, icon, color, kind)')
    .eq('user_id', user.user.id)
    .eq('is_active', true)
    .order('day_of_month', { ascending: true });

  return (data as unknown as RecurringTemplateWithCategory[]) ?? [];
}

export async function createRecurringTemplate(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const categoryId = formData.get('category_id') as string;
  const amountCents = Math.round(Number(formData.get('amount_cents')));
  const kind = formData.get('kind') as BudgetCategoryKind;
  const note = (formData.get('note') as string) || '';
  const dayOfMonth = parseInt(formData.get('day_of_month') as string) || 1;

  if (!categoryId || !Number.isFinite(amountCents) || amountCents <= 0) {
    return { error: 'Date invalide' };
  }

  const { error } = await supabase
    .from('recurring_templates')
    .insert({
      user_id: user.user.id,
      category_id: categoryId,
      amount_cents: amountCents,
      kind,
      note,
      day_of_month: Math.min(28, Math.max(1, dayOfMonth)),
    });

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function deleteRecurringTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { error } = await supabase
    .from('recurring_templates')
    .update({ is_active: false })
    .eq('id', templateId)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function processRecurringTransactions(yearMonth?: string): Promise<number> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return 0;

  const ref = yearMonth ? new Date(yearMonth + '-01') : new Date();
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Get all active templates
  const { data: templates } = await supabase
    .from('recurring_templates')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('is_active', true);

  if (!templates || templates.length === 0) return 0;

  // Get existing transactions for this month that were auto-generated (note contains [rec])
  const monthStart = new Date(year, month, 1).toLocaleDateString('sv-SE');
  const monthEnd = new Date(year, month + 1, 1).toLocaleDateString('sv-SE');

  const { data: existing } = await supabase
    .from('transactions')
    .select('note')
    .eq('user_id', user.user.id)
    .gte('transaction_date', monthStart)
    .lt('transaction_date', monthEnd)
    .like('note', '%[rec:%');

  const processedIds = new Set<string>();
  for (const t of (existing ?? [])) {
    const match = (t.note as string).match(/\[rec:([^\]]+)\]/);
    if (match) processedIds.add(match[1]);
  }

  const rowsToInsert: Array<{
    user_id: string;
    category_id: string;
    amount_cents: number;
    kind: string;
    note: string;
    transaction_date: string;
    is_recurring: boolean;
  }> = [];

  const dayOfMonth = Math.min(new Date(year, month + 1, 0).getDate(), 28);
  const txDate = new Date(year, month, dayOfMonth).toLocaleDateString('sv-SE');

  for (const tmpl of templates) {
    if (processedIds.has(tmpl.id)) continue;

    if (year === new Date().getFullYear() && month === new Date().getMonth()) {
      if (new Date().getDate() < tmpl.day_of_month) continue;
    }

    const note = tmpl.note ? `${tmpl.note} [rec:${tmpl.id}]` : `[rec:${tmpl.id}]`;

    rowsToInsert.push({
      user_id: user.user.id,
      category_id: tmpl.category_id,
      amount_cents: tmpl.amount_cents,
      kind: tmpl.kind,
      note,
      transaction_date: txDate,
      is_recurring: true,
    });
  }

  let created = 0;
  if (rowsToInsert.length > 0) {
    const { error } = await supabase
      .from('transactions')
      .insert(rowsToInsert);
    if (!error) created = rowsToInsert.length;
  }

  if (created > 0) revalidatePath('/budgets');
  return created;
}
