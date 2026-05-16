import { getHabits, getArchivedHabits } from '@/lib/actions/habits';
import { HabitGrid } from '@/components/habits/habit-list';
import { ArchivedHabits } from '@/components/habits/archived-habits';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function HabitsPage() {
  const [habits, archived] = await Promise.all([getHabits(), getArchivedHabits()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Obiceiurile mele
        </h1>
        <Link
          href="/habits/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Obicei nou
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nu ai niciun obicei. Creeaza primul!
          </p>
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Creeaza obicei
          </Link>
        </div>
      ) : (
        <HabitGrid habits={habits} />
      )}

      {archived.length > 0 && (
        <ArchivedHabits habits={archived} />
      )}
    </div>
  );
}
