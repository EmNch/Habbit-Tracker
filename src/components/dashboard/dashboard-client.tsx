'use client';

import { useState, useEffect } from 'react';
import type { HabitWithStats, DashboardSummary, Target } from '@/lib/types';
import { SummaryCards } from './summary-cards';
import { MotivationalHeader } from './motivational-header';
import { ActivityHeatmap } from './activity-heatmap';
import { HabitStatsGrid } from './habit-stats-grid';
import { TargetCountdown } from './target-countdown';
import { EmptyDashboard } from './empty-state';
import { Confetti } from '@/components/gamification/confetti';
import { ContextualMessage } from '@/components/gamification/contextual-message';

interface DashboardClientProps {
  habits: HabitWithStats[];
  summary: DashboardSummary | null;
  targets: Target[];
}

export function DashboardClient({ habits, summary, targets }: DashboardClientProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(0);

  useEffect(() => {
    if (summary && summary.completionRateToday === 100 && prevCompleted > 0 && prevCompleted < summary.totalHabits) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
    if (summary) {
      setPrevCompleted(summary.completedToday);
    }
  }, [summary?.completedToday, summary?.totalHabits, summary?.completionRateToday]);

  if (habits.length === 0 || !summary) {
    return <EmptyDashboard hasHabits={false} />;
  }

  const allCompleted = summary.completionRateToday === 100;
  const hourOfDay = new Date().getHours();

  return (
    <div className="space-y-4">
      <Confetti active={showConfetti} />

      <ContextualMessage
        totalHabits={summary.totalHabits}
        completedToday={summary.completedToday}
        currentStreak={summary.currentGlobalStreak}
        hourOfDay={hourOfDay}
      />

      <MotivationalHeader summary={summary} />
      <SummaryCards summary={summary} />

      {/* Targets countdown */}
      {targets.length > 0 && (
        <TargetCountdown targets={targets} />
      )}

      {/* Heatmap */}
      <ActivityHeatmap
        data={summary.heatmapData}
        deadlines={targets
          .filter((t) => !t.is_completed && t.deadline)
          .map((t) => ({ date: t.deadline!, color: t.color, name: t.name }))}
      />

      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Obiceiurile tale
        </h2>
        <HabitStatsGrid habits={habits} />
      </div>

      {allCompleted && (
        <div className="text-center py-4 animate-fade-in">
          <p className="text-2xl mb-1">🎊</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Ai completat toate obiceiurile de azi!
          </p>
        </div>
      )}
    </div>
  );
}
