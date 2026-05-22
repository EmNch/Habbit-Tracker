'use server';

import { createClient, getCachedUser } from '@/lib/supabase/server';
import { getDebtsSummary } from '@/lib/actions/debts';
import type { FinancialEntry, FinancialSummary, SavingGoal } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type DbRow = Record<string, unknown>;

function getLocalToday(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('sv-SE');
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('sv-SE');
  return { start, end };
}

// ============================================
// Aggregation
// ============================================

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const user = await getCachedUser();
  if (!user) {
    return { totalBalanceCents: 0, monthlyIncomeCents: 0, monthlyExpenseCents: 0, totalSavingsCents: 0, debtSummary: { debts: [], totalDebtCents: 0, totalPaidCents: 0, totalRemainingCents: 0 } };
  }

  const supabase = await createClient();
  const { start, end } = getMonthRange();

  const [allEntries, monthlyEntries, debtSummary] = await Promise.all([
    supabase
      .from('financial_entries')
      .select('kind, amount_cents')
      .eq('user_id', user.id),
    supabase
      .from('financial_entries')
      .select('kind, amount_cents')
      .eq('user_id', user.id)
      .gte('entry_date', start)
      .lte('entry_date', end),
    getDebtsSummary(),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let totalSavings = 0;

  for (const row of (allEntries.data as DbRow[]) ?? []) {
    if (row.kind === 'income') totalIncome += row.amount_cents as number;
    else if (row.kind === 'expense') totalExpense += row.amount_cents as number;
    else if (row.kind === 'saving') totalSavings += row.amount_cents as number;
  }

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  for (const row of (monthlyEntries.data as DbRow[]) ?? []) {
    if (row.kind === 'income') monthlyIncome += row.amount_cents as number;
    else if (row.kind === 'expense') monthlyExpense += row.amount_cents as number;
  }

  return {
    totalBalanceCents: totalIncome - totalExpense,
    monthlyIncomeCents: monthlyIncome,
    monthlyExpenseCents: monthlyExpense,
    totalSavingsCents: totalSavings,
    debtSummary,
  };
}

// ============================================
// Entries CRUD
// ============================================

export async function getFinancialEntries(
  kind?: 'income' | 'expense' | 'saving',
  limit: number = 50,
): Promise<FinancialEntry[]> {
  const user = await getCachedUser();
  if (!user) return [];

  const supabase = await createClient();
  let query = supabase
    .from('financial_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (kind) query = query.eq('kind', kind);

  const { data } = await query;
  return (data as DbRow[])?.map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    kind: r.kind as FinancialEntry['kind'],
    amount_cents: r.amount_cents as number,
    category: (r.category as string) ?? '',
    description: (r.description as string) ?? '',
    saving_goal_id: (r.saving_goal_id as string) ?? null,
    entry_date: r.entry_date as string,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  })) ?? [];
}

export async function createFinancialEntry(formData: FormData) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  const amount = parseFloat(formData.get('amount') as string) || 0;

  const goalId = (formData.get('saving_goal_id') as string)?.trim() || null;

  await supabase.from('financial_entries').insert({
    user_id: user.id,
    kind: formData.get('kind') as string,
    amount_cents: Math.round(amount * 100),
    category: (formData.get('category') as string)?.trim() || '',
    description: (formData.get('description') as string)?.trim() || '',
    entry_date: (formData.get('entry_date') as string) || getLocalToday(),
    saving_goal_id: goalId,
  });

  revalidatePath('/financiar');
  revalidatePath('/dashboard');
}

export async function deleteFinancialEntry(id: string) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from('financial_entries').delete().eq('id', id).eq('user_id', user.id);

  revalidatePath('/financiar');
  revalidatePath('/dashboard');
}

export async function updateEntryGoal(entryId: string, goalId: string | null) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from('financial_entries')
    .update({ saving_goal_id: goalId })
    .eq('id', entryId)
    .eq('user_id', user.id);

  revalidatePath('/financiar');
  revalidatePath('/dashboard');
}

// ============================================
// Savings Goals CRUD
// ============================================

export async function getSavingsGoals(): Promise<SavingGoal[]> {
  const user = await getCachedUser();
  if (!user) return [];

  const supabase = await createClient();
  const [{ data: goals }, { data: savings }] = await Promise.all([
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('financial_entries')
      .select('saving_goal_id, amount_cents')
      .eq('user_id', user.id)
      .eq('kind', 'saving')
      .not('saving_goal_id', 'is', null),
  ]);

  const goalMap: Record<string, number> = {};
  for (const row of (savings as DbRow[]) ?? []) {
    const gid = row.saving_goal_id as string;
    goalMap[gid] = (goalMap[gid] || 0) + (row.amount_cents as number);
  }

  return (goals as DbRow[])?.map((g) => ({
    id: g.id as string,
    user_id: g.user_id as string,
    name: g.name as string,
    target_amount_cents: g.target_amount_cents as number,
    color: (g.color as string) ?? '#6366f1',
    icon: (g.icon as string) ?? '🎯',
    deadline: (g.deadline as string) ?? null,
    is_completed: g.is_completed as boolean,
    saved_cents: goalMap[g.id as string] || 0,
    created_at: g.created_at as string,
    updated_at: g.updated_at as string,
  })) ?? [];
}

export async function createSavingsGoal(formData: FormData) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  const amount = parseFloat(formData.get('target_amount') as string) || 0;

  await supabase.from('savings_goals').insert({
    user_id: user.id,
    name: (formData.get('name') as string)?.trim() || 'Obiectiv nou',
    target_amount_cents: Math.round(amount * 100),
    color: (formData.get('color') as string) || '#6366f1',
    icon: (formData.get('icon') as string) || '🎯',
    deadline: (formData.get('deadline') as string) || null,
  });

  revalidatePath('/financiar');
  revalidatePath('/dashboard');
}

export async function deleteSavingsGoal(id: string) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', user.id);

  revalidatePath('/financiar');
  revalidatePath('/dashboard');
}
