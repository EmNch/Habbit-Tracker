import { getDashboardSummary, getHabitsWithStats } from '@/lib/actions/analytics';
import { getTargets } from '@/lib/actions/targets';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function DashboardPage() {
  const [summary, habitsWithStats, targets] = await Promise.all([
    getDashboardSummary(),
    getHabitsWithStats(),
    getTargets(),
  ]);

  if (habitsWithStats.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Bine ai venit in HabitFlow
            </p>
          </div>
          <Link
            href="/habits/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Obicei nou
          </Link>
        </div>
        <DashboardClient habits={[]} summary={null} targets={[]} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Obiceiurile tale de azi
          </p>
        </div>
        <Link
          href="/habits/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Obicei nou
        </Link>
      </div>

      <DashboardClient habits={habitsWithStats} summary={summary} targets={targets} />
    </div>
  );
}
