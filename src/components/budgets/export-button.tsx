'use client';

import { Download } from 'lucide-react';

interface ExportButtonProps {
  yearMonth?: string;
}

export function ExportButton({ yearMonth }: ExportButtonProps) {
  async function handleExport() {
    const params = new URLSearchParams();
    if (yearMonth) params.set('month', yearMonth);

    const res = await fetch(`/api/budgets/export?${params.toString()}`);
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buget-${yearMonth || 'tot'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}
