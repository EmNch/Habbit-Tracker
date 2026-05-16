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
    // Treat missing/empty as 0 (padded entries already have 0)
    const num = v != null && v !== '' ? Number(v) : 0;
    values.push({ date: e.entry_date, value: num });
  }

  const total = values.reduce((s, v) => s + v.value, 0);
  const daysWithEntry = values.filter((v) => v.value !== 0).length;
  const average = daysInRange > 0 ? total / daysInRange : 0;

  let max = -Infinity;
  let maxDate: string | null = null;
  for (const v of values) {
    if (v.value > max) {
      max = v.value;
      maxDate = v.date;
    }
  }

  // Trend: compare current half to previous half
  const midpoint = Math.floor(values.length / 2);
  const currentPeriod = values.slice(0, midpoint);
  const prevPeriod = values.slice(midpoint);
  const currentTotal = currentPeriod.reduce((s, v) => s + v.value, 0);
  const prevTotal = prevPeriod.reduce((s, v) => s + v.value, 0);

  let trend: number | null = null;
  if (prevTotal > 0) {
    trend = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  } else if (currentTotal > 0) {
    trend = 100;
  }

  return { total: Math.round(total * 100) / 100, average: Math.round(average * 10) / 10, daysWithEntry, max: max === -Infinity ? 0 : max, maxDate, trend, prevTotal: Math.round(prevTotal * 100) / 100 };
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

  // Entries sorted by date asc (padded with false for missing days)
  const boolEntries = entries
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
