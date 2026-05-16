import { getHabitWithFields } from '@/lib/actions/habits';
import { getEntry, getEntries } from '@/lib/actions/entries';
import { HabitDetailClient } from '@/components/habits/habit-detail-client';
import { today } from '@/lib/utils/date';
import Link from 'next/link';

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: habitId } = await params;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [habit, entry, history] = await Promise.all([
    getHabitWithFields(habitId),
    getEntry(habitId, today()),
    getEntries(habitId, thirtyDaysAgo.toISOString().split('T')[0], today()),
  ]);

  if (!habit) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">
          Obiceiul nu a fost găsit
        </p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
          Înapoi la dashboard
        </Link>
      </div>
    );
  }

  return (
    <HabitDetailClient
      habit={habit}
      initialEntry={entry}
      initialHistory={history}
    />
  );
}
