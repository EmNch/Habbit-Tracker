import { getPersonalities } from '@/lib/actions/personalities';
import { PersonalitiesClient } from '@/components/personalities/personalities-client';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';

export default async function PersonalitiesPage() {
  const personalities = await getPersonalities();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Personalități
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/personalities/summaries"
            className="flex items-center gap-1.5 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium rounded-lg transition"
          >
            <BookOpen className="w-4 h-4" />
            Rezumate
          </Link>
          <Link
            href="/personalities/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Adaugă
          </Link>
        </div>
      </div>
      <PersonalitiesClient initialPersonalities={personalities} />
    </div>
  );
}
