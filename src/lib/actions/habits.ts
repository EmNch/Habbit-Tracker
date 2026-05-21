'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Habit, HabitFieldDefinition, HabitWithFields } from '@/lib/types';

export async function getHabits(): Promise<Habit[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('habits')
    .select('id, user_id, name, description, cover_image_url, color, icon, is_active, reminder_enabled, reminder_time, reminder_timezone, stats_cache, created_at, updated_at')
    .eq('user_id', user.user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (data as Habit[]) ?? [];
}

export async function getHabitWithFields(habitId: string): Promise<HabitWithFields | null> {
  const supabase = await createClient();

  const { data: habit } = await supabase
    .from('habits')
    .select('id, user_id, name, description, cover_image_url, color, icon, is_active, reminder_enabled, reminder_time, reminder_timezone, stats_cache, created_at, updated_at')
    .eq('id', habitId)
    .single();

  if (!habit) return null;

  const { data: fields } = await supabase
    .from('habit_field_definitions')
    .select('id, habit_id, field_key, field_label, field_type, is_required, field_options, sort_order, is_deleted, deleted_at, created_at, updated_at')
    .eq('habit_id', habitId)
    .eq('is_deleted', false)
    .order('sort_order', { ascending: true });

  return {
    ...(habit as Habit),
    field_definitions: (fields as HabitFieldDefinition[]) ?? [],
  };
}

export async function createHabit(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const color = (formData.get('color') as string) || '#6366f1';
  const icon = (formData.get('icon') as string) || '📋';
  const reminderEnabled = formData.get('reminder_enabled') === 'true';
  const reminderTime = (formData.get('reminder_time') as string) || null;
  const reminderTimezone =
    (formData.get('reminder_timezone') as string) || 'Europe/Bucharest';

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.user.id,
      name,
      description,
      color,
      icon,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderEnabled && reminderTime ? reminderTime : null,
      reminder_timezone: reminderTimezone,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/habits');
  return { success: true, id: (data as Habit).id };
}

export async function updateHabit(habitId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const color = (formData.get('color') as string) || '#6366f1';
  const icon = (formData.get('icon') as string) || '📋';
  const reminderEnabled = formData.get('reminder_enabled') === 'true';
  const reminderTime = (formData.get('reminder_time') as string) || null;

  const { error } = await supabase
    .from('habits')
    .update({
      name,
      description,
      color,
      icon,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderEnabled && reminderTime ? reminderTime : null,
    })
    .eq('id', habitId);

  if (error) return { error: error.message };

  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', habitId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/habits');
  return { success: true };
}

export async function getArchivedHabits(): Promise<Habit[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('habits')
    .select('id, user_id, name, description, cover_image_url, color, icon, is_active, reminder_enabled, reminder_time, reminder_timezone, stats_cache, created_at, updated_at')
    .eq('user_id', user.user.id)
    .eq('is_active', false)
    .order('updated_at', { ascending: false });

  return (data as Habit[]) ?? [];
}

export async function reactivateHabit(habitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('habits')
    .update({ is_active: true })
    .eq('id', habitId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/habits');
  return { success: true };
}
