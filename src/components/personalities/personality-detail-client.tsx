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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start gap-4">
          {personality.image_url ? (
            <Image
              src={personality.image_url}
              alt={personality.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ backgroundColor: personality.color + '20' }}
            >
              {personality.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{personality.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {catLabel}
              </span>
              {personality.link && (
                <a
                  href={personality.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Link extern
                </a>
              )}
            </div>
            {personality.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line">
                {personality.notes}
              </p>
            )}
          </div>
          <Link
            href={`/personalities/${personality.id}/edit`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition flex-shrink-0"
          >
            <Edit3 className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Articles section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Articole ({articles.length})
          </h3>
        </div>
        <Link
          href={`/personalities/${personality.id}/articles/new`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Articol nou
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Niciun articol încă. Adaugă ce ai învățat!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link href={`/personalities/${personality.id}/articles/${article.id}/edit`}>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      {article.title}
                    </h4>
                  </Link>
                  {article.content && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                      {article.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {PERSONALITY_CATEGORIES.find((c) => c.value === article.category)?.label}
                    </span>
                    {article.tags.length > 0 && article.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        {tag}
                      </span>
                    ))}
                    {article.source_link && (
                      <a
                        href={article.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Sursă
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition flex-shrink-0"
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
