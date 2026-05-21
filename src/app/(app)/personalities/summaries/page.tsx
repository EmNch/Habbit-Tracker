import { getAllArticlesByCategory } from '@/lib/actions/personality-articles';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { PERSONALITY_CATEGORIES } from '@/lib/types';

export default async function SummariesPage() {
  const grouped = await getAllArticlesByCategory();

  const categoriesWithCount = PERSONALITY_CATEGORIES
    .map((cat) => ({
      ...cat,
      count: (grouped[cat.value] ?? []).length,
    }))
    .filter((c) => c.count > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/personalities"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rezumate pe categorie
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Compilarea articolelor tale din fiecare categorie
          </p>
        </div>
      </div>

      {categoriesWithCount.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Adaugă articole la personalități pentru a genera rezumate.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoriesWithCount.map((cat) => (
            <Link
              key={cat.value}
              href={`/personalities/summaries/${cat.value}`}
              className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {cat.label}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  {cat.count} {cat.count === 1 ? 'articol' : 'articole'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
