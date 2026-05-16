import { getHabitWithFields } from '@/lib/actions/habits';
import { EditHabitClient } from '@/components/habits/edit-habit-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: habitId } = await params;
  const habit = await getHabitWithFields(habitId);

  if (!habit) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Obiceiul nu a fost găsit</p>
        <Link href="/habits" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
          Înapoi la obiceiuri
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/habits/${habitId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Editează {habit.icon} {habit.name}
        </h1>
      </div>
      <EditHabitClient habit={habit} />
    </div>
  );
}
