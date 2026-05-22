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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după nume sau note..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Category filter */}
      {usedCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                  activeCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
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
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Nu ai adăugat nicio personalitate încă.
          </p>
        </div>
      )}

      {/* No results */}
      {personalities.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm font-medium">
          Niciun rezultat pentru &quot;{search}&quot;
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="group bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/personalities/${p.id}`} className="flex items-start gap-3.5 flex-1 min-w-0">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <span
                    className="text-xl flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${p.color}15` }}
                  >
                    {p.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {p.name}
                  </h3>
                  {p.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {p.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                      {PERSONALITY_CATEGORIES.find((c) => c.value === p.category)?.label}
                    </span>
                    {p.link && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <ExternalLink className="w-3 h-3" />
                        Link
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition flex-shrink-0 opacity-0 group-hover:opacity-100"
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
