'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { FieldType, FieldOptions } from '@/lib/types';

export async function addField(
  habitId: string,
  fieldKey: string,
  fieldLabel: string,
  fieldType: FieldType,
  fieldOptions: FieldOptions,
  isRequired: boolean = false,
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('habit_field_definitions')
    .select('sort_order')
    .eq('habit_id', habitId)
    .eq('is_deleted', false)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from('habit_field_definitions').insert({
    habit_id: habitId,
    field_key: fieldKey,
    field_label: fieldLabel,
    field_type: fieldType,
    field_options: fieldOptions,
    sort_order: nextOrder,
    is_required: isRequired,
  });

  if (error) return { error: error.message };

  revalidatePath(`/habits/${habitId}`);
  return { success: true };
}

export async function updateField(
  fieldId: string,
  habitId: string,
  updates: {
    field_label?: string;
    field_options?: FieldOptions;
    is_required?: boolean;
    sort_order?: number;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('habit_field_definitions')
    .update(updates)
    .eq('id', fieldId);

  if (error) return { error: error.message };

  revalidatePath(`/habits/${habitId}`);
  return { success: true };
}

export async function softDeleteField(fieldId: string, habitId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('habit_field_definitions')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', fieldId);

  if (error) return { error: error.message };

  revalidatePath(`/habits/${habitId}`);
  return { success: true };
}

export async function reorderFields(habitId: string, fieldIds: string[]) {
  const supabase = await createClient();

  const updates = fieldIds.map((id, index) =>
    supabase
      .from('habit_field_definitions')
      .update({ sort_order: index })
      .eq('id', id),
  );

  await Promise.all(updates);

  revalidatePath(`/habits/${habitId}`);
  return { success: true };
}
