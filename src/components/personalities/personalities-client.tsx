'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Trash2, ExternalLink, Users } from 'lucide-react';
import { deletePersonality } from '@/lib/actions/personalities';
import { PERSONALITY_CATEGORIES, type Personality, type PersonalityCategory } from '@/lib/types';

export function PersonalitiesClient({ initialPersonalities }: { initialPersonalities: Personality[] }) {
  const [personalities, setPersonalities] = useState(initialPersonalities);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PersonalityCategory | 'all'>('all');

  async function handleDelete(id: string) {
    await deletePersonality(id);
    setPersonalities((p) => p.filter((x) => x.id !== id));
  }

  const filtered = useMemo(() => personalities.filter((p) => {
    const matchesSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.notes.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [personalities, search, activeCategory]);

  const usedCategories = useMemo(() => [...new Set(personalities.map((p) => p.category))], [personalities]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of personalities) {
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    }
    return counts;
  }, [personalities]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după nume sau note..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Category filter */}
      {usedCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Toate ({personalities.length})
          </button>
          {PERSONALITY_CATEGORIES
            .filter((c) => usedCategories.includes(c.value))
            .map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  activeCategory === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.label} ({categoryCounts.get(cat.value) || 0})
              </button>
            ))}
        </div>
      )}

      {/* Empty state */}
      {personalities.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nu ai adăugat nicio personalitate încă.
          </p>
        </div>
      )}

      {/* No results */}
      {personalities.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
          Niciun rezultat pentru &quot;{search}&quot;
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition hover:border-gray-300 dark:hover:border-gray-600"
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/personalities/${p.id}`} className="flex items-start gap-3 flex-1 min-w-0">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <span
                    className="text-2xl flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: p.color + '20' }}
                  >
                    {p.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {p.name}
                  </h3>
                  {p.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {p.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {PERSONALITY_CATEGORIES.find((c) => c.value === p.category)?.label}
                    </span>
                    {p.link && (
                      <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                        <ExternalLink className="w-3 h-3" />
                        Link
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
