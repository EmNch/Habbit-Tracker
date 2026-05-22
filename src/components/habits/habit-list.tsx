import Link from 'next/link';
import type { Habit } from '@/lib/types';

export function HabitGrid({ habits }: { habits: Habit[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
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
      className="group block bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
    >
      {habit.cover_image_url && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${habit.cover_image_url})` }}
        />
      )}
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${habit.color}15` }}
          >
            {habit.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
              {habit.name}
            </h3>
          </div>
        </div>
        {habit.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 ml-14">
            {habit.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <span className="text-[11px] font-medium text-gray-400">Apasă pentru azi</span>
        </div>
      </div>
    </Link>
  );
}
