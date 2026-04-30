'use client';

import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyDashboardProps {
  hasHabits: boolean;
}

export function EmptyDashboard({ hasHabits }: EmptyDashboardProps) {
  if (!hasHabits) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Bine ai venit în HabitFlow!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Începe prin a crea primul tău obicei. Poți personaliza fiecare obicei
          cu câmpuri proprii — de la numere și ratinguri la texte și toggle-uri.
        </p>
        <Link
          href="/habits/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Creează primul obicei
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-3xl">
        ☀️
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">
        Încă nimic logat azi
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
        Completează-ți obiceiurile de azi pentru a menține streak-ul!
      </p>
    </div>
  );
}
