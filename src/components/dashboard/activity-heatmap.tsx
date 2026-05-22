'use client';

import { useState, useMemo } from 'react';
import type { HeatmapDay } from '@/lib/types';
import { Activity, Palette } from 'lucide-react';

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
  const [range, setRange] = useState<TimeRange>('all');
  const [colorIdx, setColorIdx] = useState(0);
  const [showColors, setShowColors] = useState(false);
  const colors = COLOR_PRESETS[colorIdx];

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (range === 'all') {
      const lastDeadline = deadlines.length > 0
        ? deadlines.reduce((max, d) => d.date > max ? d.date : max, deadlines[0].date)
        : '';
      const today = new Date().toLocaleDateString('sv-SE');
      const endDate = lastDeadline > today ? lastDeadline : today;

      const base = data.filter((d) => d.date <= endDate);
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

    const todayStr = new Date().toLocaleDateString('sv-SE');
    const rangeEnd = new Date();
    rangeEnd.setDate(rangeEnd.getDate() + 30);
    const rangeEndStr = rangeEnd.toLocaleDateString('sv-SE');
    const relevantDeadline = deadlines
      .filter((d) => d.date >= cutoffStr && d.date <= rangeEndStr)
      .reduce((max, d) => d.date > max ? d.date : max, todayStr);
    const endDate = relevantDeadline > todayStr ? relevantDeadline : todayStr;

    const base = data.filter((d) => d.date >= cutoffStr && d.date <= endDate);
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

  const maxCount = filteredData.reduce((max, d) => Math.max(max, d.count), 1);
  const levelData: HeatmapDay[] = filteredData.map((d) => {
    const ratio = d.count / maxCount;
    const level = (d.count === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4) as HeatmapDay['level'];
    return { ...d, level };
  });

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
  const totalActive = filteredData.filter((d) => d.count > 0).length;
  const totalDays = filteredData.length;
  const activePercent = totalDays > 0 ? Math.round((totalActive / totalDays) * 100) : 0;

  const cellSize = 12;
  const gap = 3;
  const step = cellSize + gap;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hartă activitate</h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {totalActive}/{totalDays} zile active ({activePercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => setShowColors(!showColors)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition"
              title="Schimbă culoarea"
            >
              <div className="w-4 h-4 rounded-full ring-2 ring-gray-200 dark:ring-gray-600" style={{ backgroundColor: colors.base }} />
            </button>
            {showColors && (
              <div className="absolute right-0 top-11 bg-[var(--surface)] rounded-xl border border-[var(--border-color)] shadow-xl p-2.5 z-10 flex gap-2 animate-fade-in">
                {COLOR_PRESETS.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => { setColorIdx(i); setShowColors(false); }}
                    className={`w-7 h-7 rounded-full transition-all ${
                      i === colorIdx ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'hover:scale-110'
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
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {(Object.entries(RANGE_LABELS) as [TimeRange, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              range === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        {/* Month labels */}
        <div className="flex mb-1.5 relative" style={{ paddingLeft: `${28}px`, height: '18px' }}>
          {monthPositions.map(({ label, col }, i) => (
            <span
              key={`${label}-${col}`}
              className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 absolute"
              style={{ left: `${col * step + 28}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex" style={{ gap: `${gap}px` }}>
          {/* Day labels */}
          <div className="flex flex-col" style={{ gap: `${gap}px` }}>
            {['L', '', 'M', '', 'J', '', 'D'].map((day, i) => (
              <span key={i} className="text-[10px] font-medium text-gray-300 dark:text-gray-600 flex items-center justify-end pr-1.5" style={{ width: '24px', height: `${cellSize}px` }}>
                {day}
              </span>
            ))}
          </div>

          {/* Cells */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col" style={{ gap: `${gap}px` }}>
              {week.map((day, dayIdx) => {
                const isToday = day.date === todayStr;
                const isFuture = day.date > todayStr;
                const deadline = deadlines.find((d) => d.date === day.date);
                const hasDeadline = !!deadline;
                let tooltip = day.date ? `${day.date}: ${day.count} completat(e)` : '';
                if (hasDeadline) {
                  tooltip = `${deadline!.name} — deadline!`;
                }
                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    title={tooltip}
                    className={`relative ${!day.date ? 'invisible' : ''} ${isFuture && !hasDeadline ? 'opacity-25' : ''}`}
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  >
                    {hasDeadline ? (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: 'rotate(45deg)' }}
                      >
                        <div className="w-[9px] h-[9px] rounded-[2px]" style={{ backgroundColor: deadline!.color }} />
                        <div className="absolute w-[3px] h-[3px] rounded-full bg-white dark:bg-gray-900" />
                      </div>
                    ) : (
                      <div
                        className={`w-full h-full rounded-[3px] transition-colors ${
                          isToday ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-[var(--surface)]' : ''
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
        <div className="flex items-center gap-4 mt-4 justify-between flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-gray-400">Mai puțin</span>
            {colors.levels.map((color, i) => (
              <div key={i} className="rounded-[3px]" style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: color }} />
            ))}
            <span className="text-[10px] font-medium text-gray-400">Mai mult</span>
          </div>
          {deadlines.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-[9px] h-[9px] rounded-[2px]"
                style={{ transform: 'rotate(45deg)', backgroundColor: deadlines[0].color }}
              />
              <span className="text-[10px] font-medium text-gray-400">Deadline</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
