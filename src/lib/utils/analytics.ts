import type { HabitEntry } from '@/lib/types';

export interface NumberMetrics {
  total: number;
  average: number;
  daysWithEntry: number;
  max: number;
  maxDate: string | null;
  trend: number | null; // % change vs previous equal period
  prevTotal: number;
}

export interface RatingMetrics {
  average: number;
  distribution: Record<number, number>;
  totalRatings: number;
}

export interface BooleanMetrics {
  successRate: number; // 0-100
  trueCount: number;
  falseCount: number;
  currentStreak: number;
}

export interface SelectMetrics {
  mostCommon: string | null;
  mostCommonCount: number;
  uniqueCount: number;
  distribution: Record<string, number>;
}

export function computeNumberMetrics(
  entries: HabitEntry[],
  fieldKey: string,
  daysInRange: number,
): NumberMetrics {
  const values: { date: string; value: number }[] = [];
  for (const e of entries) {
    const v = e.values[fieldKey];
    if (v != null && v !== '') {
      values.push({ date: e.entry_date, value: Number(v) });
    }
  }

  const total = values.reduce((s, v) => s + v.value, 0);
  const daysWithEntry = values.length;
  const average = daysWithEntry > 0 ? total / daysWithEntry : 0;

  let max = 0;
  let maxDate: string | null = null;
  for (const v of values) {
    if (v.value > max) {
      max = v.value;
      maxDate = v.date;
    }
  }

  // Trend: compare current period total to previous equal-length period
  // Entries are sorted by date desc (from getEntries), so first N are current period
  const midpoint = Math.floor(values.length / 2);
  const currentPeriod = values.slice(0, midpoint);
  const prevPeriod = values.slice(midpoint);
  const currentTotal = currentPeriod.reduce((s, v) => s + v.value, 0);
  const prevTotal = prevPeriod.reduce((s, v) => s + v.value, 0);

  let trend: number | null = null;
  if (prevTotal > 0) {
    trend = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  } else if (currentTotal > 0) {
    trend = 100; // went from 0 to something
  }

  return { total: Math.round(total * 100) / 100, average: Math.round(average * 10) / 10, daysWithEntry, max, maxDate, trend, prevTotal: Math.round(prevTotal * 100) / 100 };
}

export function computeRatingMetrics(
  entries: HabitEntry[],
  fieldKey: string,
): RatingMetrics {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let count = 0;

  for (const e of entries) {
    const v = Number(e.values[fieldKey]);
    if (v >= 1 && v <= 5) {
      distribution[v]++;
      sum += v;
      count++;
    }
  }

  return {
    average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    distribution,
    totalRatings: count,
  };
}

export function computeBooleanMetrics(
  entries: HabitEntry[],
  fieldKey: string,
): BooleanMetrics {
  let trueCount = 0;
  let falseCount = 0;

  // Entries sorted by date desc — reverse for streak calculation
  const boolEntries = entries
    .filter((e) => e.values[fieldKey] != null)
    .map((e) => ({ date: e.entry_date, value: e.values[fieldKey] === true }))
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const e of boolEntries) {
    if (e.value) trueCount++;
    else falseCount++;
  }

  const total = trueCount + falseCount;
  const successRate = total > 0 ? Math.round((trueCount / total) * 100) : 0;

  // Current streak of true values from the end
  let currentStreak = 0;
  for (let i = boolEntries.length - 1; i >= 0; i--) {
    if (boolEntries[i].value) currentStreak++;
    else break;
  }

  return { successRate, trueCount, falseCount, currentStreak };
}

export function computeSelectMetrics(
  entries: HabitEntry[],
  fieldKey: string,
): SelectMetrics {
  const distribution: Record<string, number> = {};

  for (const e of entries) {
    const v = e.values[fieldKey];
    if (typeof v === 'string' && v) {
      distribution[v] = (distribution[v] || 0) + 1;
    }
  }

  let mostCommon: string | null = null;
  let mostCommonCount = 0;
  for (const [key, count] of Object.entries(distribution)) {
    if (count > mostCommonCount) {
      mostCommon = key;
      mostCommonCount = count;
    }
  }

  return {
    mostCommon,
    mostCommonCount,
    uniqueCount: Object.keys(distribution).length,
    distribution,
  };
}
