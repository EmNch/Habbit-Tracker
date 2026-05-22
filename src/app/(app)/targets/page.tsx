import { getTargets, getArchivedTargets } from '@/lib/actions/targets';
import { TargetsClient } from '@/components/targets/targets-client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function TargetsPage() {
  const [targets, archived] = await Promise.all([
    getTargets(),
    getArchivedTargets(),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Targete
        </h1>
        <Link
          href="/targets/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Target nou
        </Link>
      </div>
      <TargetsClient initialTargets={targets} archivedTargets={archived} />
    </div>
  );
}
