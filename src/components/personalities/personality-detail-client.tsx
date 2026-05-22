'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit3, Plus, ExternalLink, BookOpen, Trash2 } from 'lucide-react';
import { deleteArticle } from '@/lib/actions/personality-articles';
import { PERSONALITY_CATEGORIES, type Personality, type PersonalityArticle } from '@/lib/types';

export function PersonalityDetailClient({
  personality,
  initialArticles,
}: {
  personality: Personality;
  initialArticles: PersonalityArticle[];
}) {
  const [articles, setArticles] = useState(initialArticles);

  async function handleDeleteArticle(id: string) {
    await deleteArticle(id);
    setArticles((a) => a.filter((x) => x.id !== id));
  }

  const catLabel = PERSONALITY_CATEGORIES.find((c) => c.value === personality.category)?.label;

  return (
    <>
      {/* Profile card */}
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 mb-6">
        <div className="flex items-start gap-4">
          {personality.image_url ? (
            <Image
              src={personality.image_url}
              alt={personality.name}
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl flex-shrink-0"
              style={{ backgroundColor: `${personality.color}15` }}
            >
              {personality.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{personality.name}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                {catLabel}
              </span>
              {personality.link && (
                <a
                  href={personality.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Link extern
                </a>
              )}
            </div>
            {personality.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-line leading-relaxed">
                {personality.notes}
              </p>
            )}
          </div>
          <Link
            href={`/personalities/${personality.id}/edit`}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-indigo-500 transition flex-shrink-0"
          >
            <Edit3 className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Articles section */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Articole ({articles.length})
          </h3>
        </div>
        <Link
          href={`/personalities/${personality.id}/articles/new`}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Articol nou
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Niciun articol încă. Adaugă ce ai învățat!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link href={`/personalities/${personality.id}/articles/${article.id}/edit`}>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {article.title}
                    </h4>
                  </Link>
                  {article.content && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {article.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                      {PERSONALITY_CATEGORIES.find((c) => c.value === article.category)?.label}
                    </span>
                    {article.tags.length > 0 && article.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                        {tag}
                      </span>
                    ))}
                    {article.source_link && (
                      <a
                        href={article.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Sursă
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition flex-shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
