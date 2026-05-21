import { getCategorySummary } from '@/lib/actions/category-summaries';
import { generateCategorySummary } from '@/lib/actions/category-summaries';
import { PERSONALITY_CATEGORIES, type PersonalityCategory } from '@/lib/types';
import { CategorySummaryClient } from '@/components/personalities/category-summary-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CategorySummaryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const catInfo = PERSONALITY_CATEGORIES.find((c) => c.value === category);

  if (!catInfo) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Categoria nu a fost găsită</p>
        <Link href="/personalities/summaries" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
          Înapoi
        </Link>
      </div>
    );
  }

  const [existingSummary, generatedContent] = await Promise.all([
    getCategorySummary(category as PersonalityCategory),
    generateCategorySummary(category as PersonalityCategory),
  ]);

  const initialContent = existingSummary?.content || generatedContent || '';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/personalities/summaries"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rezumat — {catInfo.label}
        </h1>
      </div>
      <CategorySummaryClient
        category={category as PersonalityCategory}
        initialContent={initialContent}
        hasExisting={!!existingSummary}
      />
    </div>
  );
}
