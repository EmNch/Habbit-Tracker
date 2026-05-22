'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { DisciplineLevel as DisciplineLevelType } from '@/lib/types';

interface DisciplineLevelProps {
  discipline: DisciplineLevelType;
}

function getDisciplineTier(percent: number): { label: string; color: string; barClass: string } {
  if (percent >= 90) return { label: 'Excelent', color: 'text-emerald-400', barClass: 'bg-gradient-to-r from-emerald-400 to-green-500' };
  if (percent >= 75) return { label: 'Foarte bun', color: 'text-emerald-400', barClass: 'bg-gradient-to-r from-teal-400 to-emerald-500' };
  if (percent >= 60) return { label: 'Bun', color: 'text-blue-400', barClass: 'bg-gradient-to-r from-blue-400 to-indigo-500' };
  if (percent >= 40) return { label: 'Mediu', color: 'text-amber-400', barClass: 'bg-gradient-to-r from-amber-400 to-orange-500' };
  if (percent >= 20) return { label: 'În curs', color: 'text-orange-400', barClass: 'bg-gradient-to-r from-orange-400 to-red-500' };
  return { label: 'La început', color: 'text-red-400', barClass: 'bg-gradient-to-r from-red-400 to-rose-500' };
}

export function DisciplineLevel({ discipline }: DisciplineLevelProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!discipline.periods || discipline.periods.length === 0) return null;

  const active = discipline.periods[activeIdx];
  const tier = getDisciplineTier(active.percent);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Nivel de disciplină
            </h3>
            {discipline.firstEntryDate && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                De la {new Date(discipline.firstEntryDate + 'T00:00:00').toLocaleDateString('ro-RO')}
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.color} bg-white/5 border border-white/10`}>
          {tier.label}
        </span>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1.5 mb-5">
        {discipline.periods.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setActiveIdx(i)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeIdx === i
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main percent */}
      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {active.percent}%
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          {active.completedEntries}/{active.expectedEntries} completări
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${tier.barClass}`}
          style={{ width: `${Math.min(100, active.percent)}%` }}
        />
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        {active.days} {active.days === 1 ? 'zi' : 'zile'} în perioadă
      </p>
    </div>
  );
}
