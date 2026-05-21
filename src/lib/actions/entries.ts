'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { buildEntrySchema } from '@/lib/validation/dynamic-zod';
import type { HabitEntry, EntryValues, HabitFieldDefinition } from '@/lib/types';

export async function getEntry(
  habitId: string,
  date: string,
): Promise<HabitEntry | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('habit_entries')
    .select('id, habit_id, user_id, entry_date, values, is_completed, created_at, updated_at')
    .eq('habit_id', habitId)
    .eq('entry_date', date)
    .single();

  return (data as HabitEntry) ?? null;
}

export async function getEntries(
  habitId: string,
  startDate: string,
  endDate: string,
): Promise<HabitEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('habit_entries')
    .select('id, habit_id, user_id, entry_date, values, is_completed, created_at, updated_at')
    .eq('habit_id', habitId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: true });

  return (data as HabitEntry[]) ?? [];
}

export async function saveHabitEntry(
  habitId: string,
  date: string,
  values: EntryValues,
  fieldDefinitions: HabitFieldDefinition[],
) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const schema = buildEntrySchema(fieldDefinitions);
  const result = schema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { error: 'Validare eșuată', details: errors };
  }

  const { error } = await supabase
    .from('habit_entries')
    .upsert(
      {
        habit_id: habitId,
        user_id: user.user.id,
        entry_date: date,
        values: result.data,
      },
      { onConflict: 'habit_id,entry_date' },
    );

  if (error) return { error: error.message };

  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteEntry(habitId: string, date: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('habit_entries')
    .delete()
    .eq('habit_id', habitId)
    .eq('entry_date', date);

  if (error) return { error: error.message };

  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
  return { success: true };
}
