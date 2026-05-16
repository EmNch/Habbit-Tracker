'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Target } from '@/lib/types';

export async function getTargets(): Promise<Target[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', user.user.id)
    .order('deadline', { ascending: true, nullsFirst: false });

  return (data as Target[]) ?? [];
}

export async function getTarget(targetId: string): Promise<Target | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data } = await supabase
    .from('targets')
    .select('*')
    .eq('id', targetId)
    .eq('user_id', user.user.id)
    .single();
  return (data as Target) ?? null;
}

export async function createTarget(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const habitId = (formData.get('habit_id') as string) || null;
  const targetValue = Number(formData.get('target_value'));
  const targetFrequency = formData.get('target_frequency') as string;
  const deadline = (formData.get('deadline') as string) || null;
  const color = (formData.get('color') as string) || '#6366f1';
  const icon = (formData.get('icon') as string) || '🎯';

  const { data, error } = await supabase
    .from('targets')
    .insert({
      user_id: user.user.id,
      habit_id: habitId,
      name,
      description,
      target_value: targetValue,
      target_frequency: targetFrequency,
      deadline,
      color,
      icon,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/targets');
  return { success: true, id: (data as Target).id };
}

export async function updateTarget(targetId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const habitId = (formData.get('habit_id') as string) || null;
  const targetValue = Number(formData.get('target_value'));
  const targetFrequency = formData.get('target_frequency') as string;
  const deadline = (formData.get('deadline') as string) || null;
  const color = (formData.get('color') as string) || '#6366f1';
  const icon = (formData.get('icon') as string) || '🎯';

  const { error } = await supabase
    .from('targets')
    .update({
      name,
      description,
      habit_id: habitId,
      target_value: targetValue,
      target_frequency: targetFrequency,
      deadline,
      color,
      icon,
    })
    .eq('id', targetId)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/targets');
  return { success: true };
}

export async function deleteTarget(targetId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { error } = await supabase
    .from('targets')
    .delete()
    .eq('id', targetId)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/targets');
  return { success: true };
}

export async function toggleTargetComplete(targetId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  // Use an atomic toggle via raw SQL to avoid race condition
  const { data, error } = await supabase.rpc('toggle_target', {
    p_target_id: targetId,
    p_user_id: user.user.id,
  });

  if (error) {
    // Fallback: if RPC doesn't exist, do read-then-write with user filter
    const { data: target } = await supabase
      .from('targets')
      .select('is_completed')
      .eq('id', targetId)
      .eq('user_id', user.user.id)
      .single();

    if (!target) return { error: 'Target negasit' };

    const newCompleted = !target.is_completed;
    const { error: updateError } = await supabase
      .from('targets')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', targetId)
      .eq('user_id', user.user.id);

    if (updateError) return { error: updateError.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/targets');
  return { success: true };
}
