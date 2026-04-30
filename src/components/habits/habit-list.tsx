import Link from 'next/link';
import type { Habit } from '@/lib/types';

export function HabitGrid({ habits }: { habits: Habit[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}

function HabitCard({ habit }: { habit: Habit }) {
  return (
    <Link
      href={`/habits/${habit.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
    >
      {habit.cover_image_url && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${habit.cover_image_url})` }}
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{habit.icon}</span>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {habit.name}
          </h3>
        </div>
        {habit.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {habit.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <span className="text-xs text-gray-400">Apasă pentru azi</span>
        </div>
      </div>
    </Link>
  );
}
