import { getArticle } from '@/lib/actions/personality-articles';
import { EditArticleClient } from '@/components/personalities/edit-article-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string; articleId: string }> }) {
  const { id: personalityId, articleId } = await params;
  const article = await getArticle(articleId);

  if (!article || article.personality_id !== personalityId) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Articolul nu a fost găsit</p>
        <Link href={`/personalities/${personalityId}`} className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
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
          Editează articol
        </h1>
      </div>
      <EditArticleClient article={article} personalityId={personalityId} />
    </div>
  );
}
