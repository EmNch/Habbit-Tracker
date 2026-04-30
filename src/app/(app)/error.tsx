'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle className="w-12 h-12 text-amber-500" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Ceva nu a funcționat
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
        {error.message || 'A apărut o eroare neașteptată.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
      >
        Încearcă din nou
      </button>
    </div>
  );
}
