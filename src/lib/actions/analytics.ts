'use server';

import { createClient, getCachedUser } from '@/lib/supabase/server';
import type {
  HabitWithStats,
  DashboardSummary,
  HeatmapDay,
  HabitStatsCache,
  DisciplineLevel,
} from '@/lib/types';

function getLocalToday(): string {
  return new Date().toLocaleDateString('sv-SE');
}

type PeriodDef = { key: string; label: string; days: number | null };

const DISCIPLINE_PERIODS: PeriodDef[] = [
  { key: '1m', label: '1 lună', days: 30 },
  { key: '3m', label: '3 luni', days: 90 },
  { key: '1y', label: '1 an', days: 365 },
  { key: 'all', label: 'Tot timpul', days: null },
];

async function computeDiscipline(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  totalActiveHabits: number,
): Promise<DisciplineLevel> {
  if (totalActiveHabits === 0) {
    return { periods: [], firstEntryDate: null };
  }

  // Find the user's first entry date
  const { data: firstEntry } = await supabase
    .from('habit_entries')
    .select('entry_date')
    .eq('user_id', userId)
    .order('entry_date', { ascending: true })
    .limit(1);

  const firstEntryDate = (firstEntry as DbRow[])?.[0]?.entry_date as string | null;
  if (!firstEntryDate) {
    return { periods: [], firstEntryDate: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString('sv-SE');
  const firstDate = new Date(firstEntryDate + 'T00:00:00');

  // Fetch all completed entries for the user (from first entry to today)
  const { data: allCompleted } = await supabase
    .from('habit_entries')
    .select('entry_date')
    .eq('user_id', userId)
    .gte('entry_date', firstEntryDate)
    .lte('entry_date', todayStr)
    .eq('is_completed', true);

  const completedRows = (allCompleted as DbRow[]) ?? [];

  // Count completed entries per day
  const completedPerDay: Record<string, number> = {};
  for (const row of completedRows) {
    const d = row.entry_date as string;
    completedPerDay[d] = (completedPerDay[d] || 0) + 1;
  }

  // Total completed entries
  const totalCompleted = completedRows.length;

  const periods = DISCIPLINE_PERIODS.map((def) => {
    let startDate: Date;
    if (def.days === null) {
      startDate = firstDate;
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - def.days + 1);
      if (startDate < firstDate) startDate = firstDate;
    }

    const startStr = startDate.toLocaleDateString('sv-SE');
    const days = Math.max(1, Math.round((today.getTime() - startDate.getTime()) / 86400000) + 1);
    const expected = totalActiveHabits * days;

    // Count completed entries within this period
    let periodCompleted = 0;
    for (const [date, count] of Object.entries(completedPerDay)) {
      if (date >= startStr && date <= todayStr) {
        periodCompleted += count;
      }
    }

    const percent = expected > 0 ? Math.min(100, Math.round((periodCompleted / expected) * 1000) / 10) : 0;

    return {
      label: def.label,
      percent,
      completedEntries: periodCompleted,
      expectedEntries: expected,
      days,
    };
  });

  return { periods, firstEntryDate };
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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const user = await getCachedUser();
  if (!user) {
    return { totalHabits: 0, completedToday: 0, currentGlobalStreak: 0, bestHabitStreak: 0, completionRateToday: 0, heatmapData: [], discipline: { periods: [], firstEntryDate: null } };
  }

  const userId = user.id;
  const supabase = await createClient();
  const today = getLocalToday();

  // Find earliest habit creation date for heatmap start
  const { data: firstHabit } = await supabase
    .from('habits')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  const firstHabitDate = (firstHabit as DbRow[])?.[0]?.created_at as string | undefined;
  const heatmapStartDate = firstHabitDate
    ? new Date(firstHabitDate)
    : new Date(Date.now() - 364 * 86400000);
  // Start from the Monday of that week
  const startDow = (heatmapStartDate.getDay() + 6) % 7;
  heatmapStartDate.setDate(heatmapStartDate.getDate() - startDow);
  const heatmapStartStr = heatmapStartDate.toLocaleDateString('sv-SE');

  // Fetch habits, today's entries, and heatmap in parallel
  const [
    { data: habits },
    { data: todayEntries },
    heatmapResult,
  ] = await Promise.all([
    supabase
      .from('habits')
      .select('id, stats_cache')
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('habit_entries')
      .select('habit_id, is_completed, values')
      .eq('user_id', userId)
      .eq('entry_date', today),
    supabase
      .from('habit_entries')
      .select('entry_date')
      .eq('user_id', userId)
      .gte('entry_date', heatmapStartStr)
      .eq('is_completed', true),
  ]);

  const activeHabits = (habits as DbRow[]) ?? [];
  const totalHabits = activeHabits.length;

  const todayRows = (todayEntries as DbRow[]) ?? [];
  const completedToday = new Set(
    todayRows
      .filter((e) => e.is_completed || entryHasContent(e.values))
      .map((e) => e.habit_id as string),
  ).size;

  const completionRateToday = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  let bestHabitStreak = 0;
  let currentGlobalStreak = 0;

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

  if (completedToday < totalHabits) {
    currentGlobalStreak = 0;
  }

  // Heatmap processing
  const heatRows = (heatmapResult.data as DbRow[]) ?? [];

  const dayCounts: Record<string, number> = {};
  for (const row of heatRows) {
    const d = row.entry_date as string;
    dayCounts[d] = (dayCounts[d] || 0) + 1;
  }

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, Math.round((todayDate.getTime() - heatmapStartDate.getTime()) / 86400000) + 1);
  // Round up to full weeks
  const totalCells = Math.ceil(totalDays / 7) * 7;

  const maxCount = Math.max(...Object.values(dayCounts), 1);
  const heatmapData: HeatmapDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(heatmapStartDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('sv-SE');
    const count = dayCounts[dateStr] ?? 0;
    const ratio = count / maxCount;
    const level = (count === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4) as HeatmapDay['level'];
    heatmapData.push({ date: dateStr, count, level });
  }

  const discipline = await computeDiscipline(supabase, userId, totalHabits);

  return { totalHabits, completedToday, currentGlobalStreak, bestHabitStreak, completionRateToday, heatmapData, discipline };
}

export async function getHabitsWithStats(): Promise<HabitWithStats[]> {
  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) return [];

  const userId = user.id;
  const today = getLocalToday();

  const [
    { data: habits, error },
    { data: todayEntries },
  ] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('habit_entries')
      .select('habit_id, is_completed, values')
      .eq('user_id', userId)
      .eq('entry_date', today),
  ]);

  if (error || !habits) return [];

  const todayRows = (todayEntries as DbRow[]) ?? [];
  const todayMap = new Map<string, { exists: boolean; completed: boolean }>();
  for (const entry of todayRows) {
    const habitId = entry.habit_id as string;
    const completed = Boolean(entry.is_completed || entryHasContent(entry.values));
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
    reminder_enabled: (h.reminder_enabled as boolean) ?? false,
    reminder_time: (h.reminder_time as string) ?? null,
    reminder_timezone: (h.reminder_timezone as string) ?? 'Europe/Bucharest',
    stats_cache: parseStatsCache(h.stats_cache),
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
