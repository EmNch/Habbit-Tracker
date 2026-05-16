import { NewPersonalityClient } from '@/components/personalities/new-personality-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPersonalityPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/personalities"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Personalitate nouă
        </h1>
      </div>
      <NewPersonalityClient />
    </div>
  );
}
