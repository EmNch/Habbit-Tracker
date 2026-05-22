'use server';

import { createClient, getCachedUser } from '@/lib/supabase/server';
import type { Debt, DebtSummary } from '@/lib/types';

type DbRow = Record<string, unknown>;

export async function getDebtsSummary(): Promise<DebtSummary> {
  const user = await getCachedUser();
  if (!user) return { debts: [], totalDebtCents: 0, totalPaidCents: 0, totalRemainingCents: 0 };

  const supabase = await createClient();
  const { data } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_paid', false)
    .order('due_date', { ascending: true, nullsFirst: false });

  const debts = (data as DbRow[] ?? []).map((d) => ({
    id: d.id as string,
    user_id: d.user_id as string,
    name: d.name as string,
    creditor: (d.creditor as string) ?? '',
    total_amount_cents: d.total_amount_cents as number,
    paid_amount_cents: d.paid_amount_cents as number,
    due_date: (d.due_date as string) ?? null,
    notes: (d.notes as string) ?? '',
    is_paid: d.is_paid as boolean,
    created_at: d.created_at as string,
    updated_at: d.updated_at as string,
  }));

  const totalDebtCents = debts.reduce((s, d) => s + d.total_amount_cents, 0);
  const totalPaidCents = debts.reduce((s, d) => s + d.paid_amount_cents, 0);

  return {
    debts,
    totalDebtCents,
    totalPaidCents,
    totalRemainingCents: totalDebtCents - totalPaidCents,
  };
}

export async function createDebt(formData: FormData) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  const amount = parseFloat(formData.get('total_amount') as string) || 0;

  await supabase.from('debts').insert({
    user_id: user.id,
    name: (formData.get('name') as string)?.trim() || 'Datorie nouă',
    creditor: (formData.get('creditor') as string)?.trim() || '',
    total_amount_cents: Math.round(amount * 100),
    due_date: (formData.get('due_date') as string) || null,
    notes: (formData.get('notes') as string)?.trim() || '',
  });
}

export async function payDebtPartial(debtId: string, amountCents: number) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();

  const { data: debt } = await supabase
    .from('debts')
    .select('paid_amount_cents, total_amount_cents')
    .eq('id', debtId)
    .eq('user_id', user.id)
    .single();

  if (!debt) return;

  const newPaid = Math.min(
    (debt as DbRow).paid_amount_cents as number + amountCents,
    (debt as DbRow).total_amount_cents as number,
  );
  const isPaid = newPaid >= ((debt as DbRow).total_amount_cents as number);

  await supabase
    .from('debts')
    .update({ paid_amount_cents: newPaid, is_paid: isPaid })
    .eq('id', debtId)
    .eq('user_id', user.id);
}

export async function deleteDebt(debtId: string) {
  const user = await getCachedUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from('debts').delete().eq('id', debtId).eq('user_id', user.id);
}
