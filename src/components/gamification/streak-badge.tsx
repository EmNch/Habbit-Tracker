'use client';

import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak <= 0) return null;

  const sizeClasses = {
    sm: 'text-xs gap-1 px-2 py-0.5',
    md: 'text-sm gap-1.5 px-3 py-1',
    lg: 'text-base gap-2 px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getTier = () => {
    if (streak >= 30) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Legendar' };
    if (streak >= 14) return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Epic' };
    if (streak >= 7) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Solid' };
    return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '' };
  };

  const tier = getTier();

  return (
    <div
      className={`inline-flex items-center rounded-full font-bold ${sizeClasses[size]} ${tier.bg} ${tier.text} ${
        streak >= 7 ? 'animate-pulse-subtle' : ''
      }`}
      title={`Streak de ${streak} zile${tier.label ? ` (${tier.label})` : ''}`}
    >
      <Flame className={`${iconSizes[size]} ${streak >= 7 ? 'animate-bounce-subtle' : ''}`} />
      <span>{streak}z</span>
      {tier.label && size !== 'sm' && (
        <span className="text-[10px] opacity-60">{tier.label}</span>
      )}
    </div>
  );
}
