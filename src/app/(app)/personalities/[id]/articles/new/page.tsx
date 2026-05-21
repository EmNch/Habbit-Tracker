import { getPersonality } from '@/lib/actions/personalities';
import { NewArticleClient } from '@/components/personalities/new-article-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: personalityId } = await params;
  const personality = await getPersonality(personalityId);

  if (!personality) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Personalitatea nu a fost găsită</p>
        <Link href="/personalities" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
          Înapoi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/personalities/${personalityId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Articol nou — {personality.icon} {personality.name}
        </h1>
      </div>
      <NewArticleClient personalityId={personalityId} defaultCategory={personality.category} />
    </div>
  );
}
