'use client';

import { useEffect, useState } from 'react';

interface ContextualMessageProps {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  hourOfDay: number;
}

export function ContextualMessage({
  totalHabits,
  completedToday,
  currentStreak,
  hourOfDay,
}: ContextualMessageProps) {
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState({ text: '', emoji: '' });

  useEffect(() => {
    const remaining = totalHabits - completedToday;

    if (completedToday === totalHabits && totalHabits > 0) {
      setMessage({ text: 'Ai terminat tot! Zi perfectă.', emoji: '🏆' });
    } else if (currentStreak >= 30) {
      setMessage({ text: `${currentStreak} zile! Ești o mașină!`, emoji: '🔥' });
    } else if (currentStreak >= 7) {
      setMessage({ text: `${currentStreak} zile consecutive. Continuă!`, emoji: '💪' });
    } else if (hourOfDay >= 21 && remaining > 0) {
      setMessage({ text: `Încă ${remaining} rămas${remaining > 1 ? 'e' : ''}. Poți!`, emoji: '🌙' });
    } else if (hourOfDay < 9 && completedToday === 0) {
      setMessage({ text: 'Dimineața e cel mai bun moment.', emoji: '☀️' });
    } else if (remaining === 1) {
      setMessage({ text: 'Mai e doar unul!', emoji: '🎯' });
    } else if (completedToday > 0) {
      setMessage({ text: `Bravo, ${completedToday} din ${totalHabits}!`, emoji: '✨' });
    }

    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [totalHabits, completedToday, currentStreak, hourOfDay]);

  if (!visible || !message.text) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg animate-fade-in">
      <span className="text-lg">{message.emoji}</span>
      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
        {message.text}
      </p>
    </div>
  );
}
