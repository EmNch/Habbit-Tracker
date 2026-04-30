'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  HabitWithStats,
  DashboardSummary,
  HeatmapDay,
  HabitStatsCache,
} from '@/lib/types';

function getLocalToday(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function parseStatsCache(raw: unknown): HabitStatsCache | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (!('current_streak' in obj)) return null;
  return {
    current_streak: Number(obj.current_streak) || 0,
    longest_streak: Number(obj.longest_streak) || 0,
    completion_rate_7d: Number(obj.completion_rate_7d) || 0,
    completion_rate_30d: Number(obj.completion_rate_30d) || 0,
    total_entries: Number(obj.total_entries) || 0,
    last_entry_date: (obj.last_entry_date as string) || null,
    updated_at: (obj.updated_at as string) || '',
  };
}

function entryHasContent(values: unknown): boolean {
  if (!values || typeof values !== 'object') return false;
  return Object.keys(values).length > 0;
}

type DbRow = Record<string, unknown>;

interface ColumnCheck {
  hasStatsCache: boolean;
  hasIsCompleted: boolean;
}

let columnCheckResult: ColumnCheck | null = null;

async function checkColumns(supabase: Awaited<ReturnType<typeof createClient>>): Promise<ColumnCheck> {
  if (columnCheckResult) return columnCheckResult;

  const { error: habitErr } = await supabase.from('habits').select('stats_cache').limit(1);
  const { error: entryErr } = await supabase.from('habit_entries').select('is_completed').limit(1);

  columnCheckResult = { hasStatsCache: !habitErr, hasIsCompleted: !entryErr };
  return columnCheckResult;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return { totalHabits: 0, completedToday: 0, currentGlobalStreak: 0, bestHabitStreak: 0, completionRateToday: 0, heatmapData: [] };
  }

  const userId = user.user.id;
  const today = getLocalToday();
  const cols = await checkColumns(supabase);

  // Fetch all active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  const activeHabits = (habits as DbRow[]) ?? [];
  const totalHabits = activeHabits.length;

  // Count today's entries with content
  const { data: todayEntries } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', today);

  const todayRows = (todayEntries as DbRow[]) ?? [];
  const completedToday = new Set(
    todayRows
      .filter((e) => {
        if (cols.hasIsCompleted && e.is_completed) return true;
        return entryHasContent(e.values);
      })
      .map((e) => e.habit_id as string),
  ).size;

  const completionRateToday = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  let bestHabitStreak = 0;
  let currentGlobalStreak = 0;

  if (cols.hasStatsCache) {
    for (const habit of activeHabits) {
      const stats = parseStatsCache(habit.stats_cache);
      if (stats) {
        if (stats.current_streak > 0 && stats.current_streak < 1000) {
          if (currentGlobalStreak === 0 || stats.current_streak < currentGlobalStreak) {
            currentGlobalStreak = stats.current_streak;
          }
        }
        if (stats.longest_streak > bestHabitStreak) {
          bestHabitStreak = stats.longest_streak;
        }
      }
    }
  }

  if (completedToday < totalHabits) {
    currentGlobalStreak = 0;
  }

  // Heatmap
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 364);
  const startDate = oneYearAgo.toLocaleDateString('sv-SE');

  let heatmapQuery = supabase
    .from('habit_entries')
    .select('entry_date')
    .eq('user_id', userId)
    .gte('entry_date', startDate);

  if (cols.hasIsCompleted) {
    heatmapQuery = heatmapQuery.eq('is_completed', true);
  }

  const { data: heatmapRaw } = await heatmapQuery;
  const heatRows = (heatmapRaw as DbRow[]) ?? [];

  const dayCounts: Record<string, number> = {};
  for (const row of heatRows) {
    const d = row.entry_date as string;
    dayCounts[d] = (dayCounts[d] || 0) + 1;
  }

  const maxCount = Math.max(...Object.values(dayCounts), 1);
  const heatmapData: HeatmapDay[] = [];
  for (let i = 0; i < 365; i++) {
    const d = new Date(oneYearAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('sv-SE');
    const count = dayCounts[dateStr] ?? 0;
    const ratio = count / maxCount;
    const level = (count === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4) as HeatmapDay['level'];
    heatmapData.push({ date: dateStr, count, level });
  }

  return { totalHabits, completedToday, currentGlobalStreak, bestHabitStreak, completionRateToday, heatmapData };
}

export async function getHabitsWithStats(): Promise<HabitWithStats[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const userId = user.user.id;
  const today = getLocalToday();
  const cols = await checkColumns(supabase);

  const { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !habits) return [];

  const { data: todayEntries } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', today);

  const todayRows = (todayEntries as DbRow[]) ?? [];
  const todayMap = new Map<string, { exists: boolean; completed: boolean }>();
  for (const entry of todayRows) {
    const habitId = entry.habit_id as string;
    const completed = Boolean((cols.hasIsCompleted && entry.is_completed) || entryHasContent(entry.values));
    todayMap.set(habitId, { exists: true, completed });
  }

  return (habits as DbRow[]).map((h) => ({
    id: h.id as string,
    user_id: h.user_id as string,
    name: h.name as string,
    description: (h.description as string) ?? '',
    cover_image_url: (h.cover_image_url as string) ?? null,
    color: (h.color as string) ?? '#6366f1',
    icon: (h.icon as string) ?? '📋',
    is_active: h.is_active as boolean,
    stats_cache: cols.hasStatsCache ? parseStatsCache(h.stats_cache) : null,
    created_at: h.created_at as string,
    updated_at: h.updated_at as string,
    todayCompleted: todayMap.get(h.id as string)?.completed ?? false,
    todayEntryExists: todayMap.get(h.id as string)?.exists ?? false,
  }));
}

export async function getFieldAggregation(
  habitId: string,
  fieldKey: string,
  days: number = 30,
): Promise<Array<{ date: string; value: unknown }>> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('habit_entries')
    .select('entry_date, values')
    .eq('habit_id', habitId)
    .gte('entry_date', startDate.toLocaleDateString('sv-SE'))
    .order('entry_date', { ascending: true });

  if (!data) return [];
  return (data as DbRow[])
    .map((row) => ({
      date: row.entry_date as string,
      value: (row.values as Record<string, unknown>)[fieldKey] ?? null,
    }))
    .filter((row) => row.value !== null);
}

export async function getRecentTextEntries(
  habitId: string,
  fieldKey: string,
  limit: number = 5,
): Promise<Array<{ date: string; value: string }>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('habit_entries')
    .select('entry_date, values')
    .eq('habit_id', habitId)
    .order('entry_date', { ascending: false })
    .limit(limit);

  if (!data) return [];
  return (data as DbRow[])
    .map((row) => ({
      date: row.entry_date as string,
      value: String((row.values as Record<string, unknown>)[fieldKey] ?? ''),
    }))
    .filter((row) => row.value && row.value !== 'null');
}
