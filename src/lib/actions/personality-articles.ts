'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PersonalityArticle } from '@/lib/types';

export async function getArticles(personalityId: string): Promise<PersonalityArticle[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('personality_articles')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('personality_id', personalityId)
    .order('created_at', { ascending: false });

  return (data as PersonalityArticle[]) ?? [];
}

export async function getArticle(id: string): Promise<PersonalityArticle | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data } = await supabase
    .from('personality_articles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.user.id)
    .single();

  return (data as PersonalityArticle) ?? null;
}

export async function getAllArticlesByCategory(): Promise<Record<string, PersonalityArticle[]>> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return {};

  const { data } = await supabase
    .from('personality_articles')
    .select('*, personalities(name, icon)')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  const grouped: Record<string, PersonalityArticle[]> = {};
  for (const article of (data ?? [])) {
    const cat = article.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(article as PersonalityArticle);
  }
  return grouped;
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const personalityId = formData.get('personality_id') as string;
  const title = formData.get('title') as string;
  const content = (formData.get('content') as string) || '';
  const category = (formData.get('category') as string) || 'general';
  const sourceLink = (formData.get('source_link') as string) || '';
  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  if (!title?.trim()) return { error: 'Titlul este obligatoriu' };
  if (!personalityId) return { error: 'Personality ID lipseste' };

  const { error } = await supabase
    .from('personality_articles')
    .insert({
      user_id: user.user.id,
      personality_id: personalityId,
      title: title.trim(),
      content,
      category,
      source_link: sourceLink,
      tags,
    });

  if (error) return { error: error.message };

  revalidatePath(`/personalities/${personalityId}`);
  revalidatePath('/personalities/summaries');
  return { success: true };
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const title = formData.get('title') as string;
  const content = (formData.get('content') as string) || '';
  const category = (formData.get('category') as string) || 'general';
  const sourceLink = (formData.get('source_link') as string) || '';
  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  if (!title?.trim()) return { error: 'Titlul este obligatoriu' };

  const { data: article } = await supabase
    .from('personality_articles')
    .select('personality_id')
    .eq('id', id)
    .eq('user_id', user.user.id)
    .single();

  const { error } = await supabase
    .from('personality_articles')
    .update({ title: title.trim(), content, category, source_link: sourceLink, tags })
    .eq('id', id)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  if (article?.personality_id) {
    revalidatePath(`/personalities/${article.personality_id}`);
  }
  revalidatePath('/personalities/summaries');
  return { success: true };
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { data: article } = await supabase
    .from('personality_articles')
    .select('personality_id')
    .eq('id', id)
    .eq('user_id', user.user.id)
    .single();

  const { error } = await supabase
    .from('personality_articles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);

  if (error) return { error: error.message };

  if (article?.personality_id) {
    revalidatePath(`/personalities/${article.personality_id}`);
  }
  revalidatePath('/personalities/summaries');
  return { success: true };
}
