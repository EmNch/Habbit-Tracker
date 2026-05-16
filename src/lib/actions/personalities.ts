'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Personality } from '@/lib/types';

export async function getPersonalities(): Promise<Personality[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('personalities')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  return (data as Personality[]) ?? [];
}

export async function getPersonality(id: string): Promise<Personality | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data } = await supabase
    .from('personalities')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.user.id)
    .single();

  return (data as Personality) ?? null;
}

export async function createPersonality(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const notes = (formData.get('notes') as string) || '';
  const category = (formData.get('category') as string) || 'general';
  const link = (formData.get('link') as string) || '';
  const icon = (formData.get('icon') as string) || '👤';
  const color = (formData.get('color') as string) || '#6366f1';

  if (!name?.trim()) return { error: 'Numele este obligatoriu' };

  const { data, error } = await supabase
    .from('personalities')
    .insert({
      user_id: user.user.id,
      name: name.trim(),
      notes,
      category,
      link,
      icon,
      color,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/personalities');
  return { success: true, id: (data as Personality).id };
}

export async function updatePersonality(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const name = formData.get('name') as string;
  const notes = (formData.get('notes') as string) || '';
  const category = (formData.get('category') as string) || 'general';
  const link = (formData.get('link') as string) || '';
  const icon = (formData.get('icon') as string) || '👤';
  const color = (formData.get('color') as string) || '#6366f1';

  if (!name?.trim()) return { error: 'Numele este obligatoriu' };

  const { error } = await supabase
    .from('personalities')
    .update({
      name: name.trim(),
      notes,
      category,
      link,
      icon,
      color,
    })
    .eq('id', id)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/personalities');
  return { success: true };
}

export async function deletePersonality(id: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { error } = await supabase
    .from('personalities')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  revalidatePath('/personalities');
  return { success: true };
}
