import { getTarget } from '@/lib/actions/targets';
import { getHabits } from '@/lib/actions/habits';
import { EditTargetClient } from '@/components/targets/edit-target-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditTargetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params;

  const [target, habits] = await Promise.all([
    getTarget(targetId),
    getHabits(),
  ]);

  if (!target) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Targetul nu a fost găsit</p>
        <Link href="/targets" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
          Înapoi la targete
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/targets"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Editeaza {target.icon} {target.name}
        </h1>
      </div>
      <EditTargetClient target={target} habits={habits} />
    </div>
  );
}
