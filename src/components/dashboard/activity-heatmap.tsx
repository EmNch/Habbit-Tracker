'use client';

import { useState, useMemo } from 'react';
import type { HeatmapDay } from '@/lib/types';
import { Palette } from 'lucide-react';

type TimeRange = '1m' | '3m' | '6m' | '1y' | 'all';

const RANGE_LABELS: Record<TimeRange, string> = {
  '1m': '1 lună',
  '3m': '3 luni',
  '6m': '6 luni',
  '1y': '1 an',
  'all': 'Tot',
};

const RANGE_DAYS: Record<TimeRange, number> = {
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
  'all': 9999,
};

const COLOR_PRESETS = [
  { name: 'Emerald', base: '#10b981', levels: ['#d1fae5', '#6ee7b7', '#34d399', '#10b981', '#059669'] },
  { name: 'Indigo', base: '#6366f1', levels: ['#e0e7ff', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'] },
  { name: 'Blue', base: '#3b82f6', levels: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'] },
  { name: 'Rose', base: '#f43f5e', levels: ['#ffe4e6', '#fda4af', '#fb7185', '#f43f5e', '#e11d48'] },
  { name: 'Amber', base: '#f59e0b', levels: ['#fef3c7', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706'] },
  { name: 'Purple', base: '#a855f7', levels: ['#f3e8ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea'] },
  { name: 'Teal', base: '#14b8a6', levels: ['#ccfbf1', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488'] },
  { name: 'Orange', base: '#f97316', levels: ['#fff7ed', '#fdba74', '#fb923c', '#f97316', '#ea580c'] },
];

const MONTH_LABELS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DeadlineMarker {
  date: string;
  color: string;
  name: string;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  deadlines?: DeadlineMarker[];
}

export function ActivityHeatmap({ data, deadlines = [] }: ActivityHeatmapProps) {
  const [range, setRange] = useState<TimeRange>('3m');
  const [colorIdx, setColorIdx] = useState(0);
  const [showColors, setShowColors] = useState(false);
  const colors = COLOR_PRESETS[colorIdx];

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (range === 'all') {
      // "All" = from first recorded day to furthest deadline (or today)
      const lastDeadline = deadlines.length > 0
        ? deadlines.reduce((max, d) => d.date > max ? d.date : max, deadlines[0].date)
        : '';
      const today = new Date().toLocaleDateString('sv-SE');
      const endDate = lastDeadline > today ? lastDeadline : today;

      const base = data.filter((d) => d.date <= endDate);
      // Extend with future empty days up to endDate
      const lastBaseDate = base.length > 0 ? base[base.length - 1].date : '';
      if (endDate > lastBaseDate) {
        const d = new Date(lastBaseDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        while (d.toLocaleDateString('sv-SE') <= endDate) {
          base.push({ date: d.toLocaleDateString('sv-SE'), count: 0, level: 0 });
          d.setDate(d.getDate() + 1);
        }
      }
      return base;
    }

    const days = RANGE_DAYS[range];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toLocaleDateString('sv-SE');

    // End date: furthest deadline within range, or today
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const rangeEnd = new Date();
    rangeEnd.setDate(rangeEnd.getDate() + 30); // look 30 days ahead for deadlines
    const rangeEndStr = rangeEnd.toLocaleDateString('sv-SE');
    const relevantDeadline = deadlines
      .filter((d) => d.date >= cutoffStr && d.date <= rangeEndStr)
      .reduce((max, d) => d.date > max ? d.date : max, todayStr);
    const endDate = relevantDeadline > todayStr ? relevantDeadline : todayStr;

    const base = data.filter((d) => d.date >= cutoffStr && d.date <= endDate);
    // Extend with future empty days up to endDate
    const lastBaseDate = base.length > 0 ? base[base.length - 1].date : cutoffStr;
    if (endDate > lastBaseDate) {
      const d = new Date(lastBaseDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      while (d.toLocaleDateString('sv-SE') <= endDate) {
        base.push({ date: d.toLocaleDateString('sv-SE'), count: 0, level: 0 });
        d.setDate(d.getDate() + 1);
      }
    }
    return base;
  }, [data, range, deadlines]);

  if (!data || data.length === 0) return null;

  // Recalculate levels for filtered data
  const maxCount = Math.max(...filteredData.map((d) => d.count), 1);
  const levelData: HeatmapDay[] = filteredData.map((d) => {
    const ratio = d.count / maxCount;
    const level = (d.count === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4) as HeatmapDay['level'];
    return { ...d, level };
  });

  // Group into weeks
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  if (levelData.length > 0) {
    const firstDay = new Date(levelData[0].date + 'T00:00:00');
    const firstDow = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < firstDow; i++) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }
  }

  for (const day of levelData) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: '', count: 0, level: 0 });
    weeks.push(currentWeek);
  }

  // Month labels
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const validDay = week.find((d) => d.date);
    if (validDay) {
      const month = new Date(validDay.date + 'T00:00:00').getMonth();
      if (month !== lastMonth) {
        monthPositions.push({ label: MONTH_LABELS[month], col });
        lastMonth = month;
      }
    }
  });

  const todayStr = new Date().toLocaleDateString('sv-SE');

  // Stats
  const totalActive = filteredData.filter((d) => d.count > 0).length;
  const totalDays = filteredData.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Hartă activitate
          <span className="font-normal text-gray-400 ml-2">
            {totalActive}/{totalDays} zile active
          </span>
        </h3>
        <div className="flex items-center gap-2">
          {/* Color picker toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColors(!showColors)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Schimbă culoarea"
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.base }} />
            </button>
            {showColors && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-2 z-10 flex gap-1.5 animate-fade-in">
                {COLOR_PRESETS.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => { setColorIdx(i); setShowColors(false); }}
                    className={`w-6 h-6 rounded-full transition ${
                      i === colorIdx ? 'ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: preset.base }}
                    title={preset.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time range tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {(Object.entries(RANGE_LABELS) as [TimeRange, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
              range === key
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={range === key ? { backgroundColor: colors.base } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1">
        {/* Month labels */}
        <div className="flex mb-1 ml-[28px] h-4 relative">
          {monthPositions.map(({ label, col }, i) => (
            <span
              key={`${label}-${col}`}
              className="text-[10px] text-gray-400 dark:text-gray-500 absolute"
              style={{ left: `${col * 14 + 28}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px]">
            {['L', '', 'M', '', 'J', '', 'D'].map((day, i) => (
              <span key={i} className="w-[24px] h-[11px] text-[9px] text-gray-400 dark:text-gray-500 flex items-center justify-end pr-1">
                {day}
              </span>
            ))}
          </div>

          {/* Cells */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {week.map((day, dayIdx) => {
                const isToday = day.date === todayStr;
                const isFuture = day.date > todayStr;
                const deadline = deadlines.find((d) => d.date === day.date);
                const hasDeadline = !!deadline;
                let tooltip = day.date ? `${day.date}: ${day.count} completat(e)` : '';
                if (hasDeadline) {
                  tooltip = `🎯 ${deadline!.name} — deadline!`;
                }
                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    title={tooltip}
                    className={`w-[11px] h-[11px] relative ${
                      !day.date ? 'invisible' :
                      hasDeadline ? '' :
                      'rounded-[2px]'
                    } ${isFuture && !hasDeadline ? 'opacity-30' : ''}`}
                  >
                    {hasDeadline ? (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: 'rotate(45deg)' }}
                      >
                        <div
                          className="w-[8px] h-[8px] rounded-[1px]"
                          style={{ backgroundColor: deadline!.color }}
                        />
                        <div
                          className="absolute w-[3px] h-[3px] rounded-full bg-white dark:bg-gray-900"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-full h-full rounded-[2px] ${
                          isToday ? 'ring-1 ring-indigo-400' : ''
                        }`}
                        style={{ backgroundColor: isFuture ? colors.levels[0] : colors.levels[day.level] }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 mr-1">Mai putin</span>
            {colors.levels.map((color, i) => (
              <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: color }} />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">Mai mult</span>
          </div>
          {deadlines.length > 0 && (
            <div className="flex items-center gap-1">
              <div
                className="w-[8px] h-[8px] rounded-[1px]"
                style={{ transform: 'rotate(45deg)', backgroundColor: deadlines[0].color }}
              />
              <span className="text-[10px] text-gray-400">Deadline target</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
