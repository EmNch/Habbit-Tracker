'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, RefreshCw, Loader2 } from 'lucide-react';
import { upsertCategorySummary } from '@/lib/actions/category-summaries';
import type { PersonalityCategory } from '@/lib/types';

export function CategorySummaryClient({
  category,
  initialContent,
  hasExisting,
}: {
  category: PersonalityCategory;
  initialContent: string;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleSave() {
    setSaving(true);
    await upsertCategorySummary(category, content);
    setSaving(false);
    router.refresh();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    const { generateCategorySummary } = await import('@/lib/actions/category-summaries');
    const generated = await generateCategorySummary(category);
    if (generated) setContent(generated);
    setRegenerating(false);
  }

  if (!content) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Niciun articol în această categorie. Adaugă articole la personalități pentru a genera un rezumat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {hasExisting ? (
            <span>Rezumat salvat — editabil</span>
          ) : (
            <span>Generat automat din articole — editează și salvează</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerează
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvează
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={Math.max(20, content.split('\n').length + 4)}
        className="w-full px-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y font-mono text-sm leading-relaxed"
      />
    </div>
  );
}
