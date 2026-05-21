'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PERSONALITY_CATEGORIES, type CategorySummary, type PersonalityCategory } from '@/lib/types';

export async function getCategorySummary(category: PersonalityCategory): Promise<CategorySummary | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data } = await supabase
    .from('category_summaries')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('category', category)
    .single();

  return (data as CategorySummary) ?? null;
}

export async function getAllCategorySummaries(): Promise<CategorySummary[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data } = await supabase
    .from('category_summaries')
    .select('*')
    .eq('user_id', user.user.id);

  return (data as CategorySummary[]) ?? [];
}

export async function upsertCategorySummary(category: PersonalityCategory, content: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Neautentificat' };

  const { error } = await supabase
    .from('category_summaries')
    .upsert({
      user_id: user.user.id,
      category,
      content,
    }, { onConflict: 'user_id,category' });

  if (error) return { error: error.message };

  revalidatePath('/personalities/summaries');
  return { success: true };
}

export async function generateCategorySummary(category: PersonalityCategory): Promise<string> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return '';

  const { data: articles } = await supabase
    .from('personality_articles')
    .select('title, content, tags, personalities(name)')
    .eq('user_id', user.user.id)
    .eq('category', category)
    .order('created_at', { ascending: true });

  if (!articles || articles.length === 0) return '';

  const catLabel = PERSONALITY_CATEGORIES.find((c) => c.value === category)?.label ?? category;

  const sections = articles.map((a) => {
    const pName = (a.personalities as unknown as { name: string })?.name ?? 'Necunoscut';
    const tagsStr = (a.tags as string[]).length > 0 ? `\nTeme: ${(a.tags as string[]).join(', ')}` : '';
    return `## ${a.title}\n**De la ${pName}**${tagsStr}\n\n${a.content}`;
  });

  return `# Rezumat ${catLabel}\n\n${sections.join('\n\n---\n\n')}`;
}
