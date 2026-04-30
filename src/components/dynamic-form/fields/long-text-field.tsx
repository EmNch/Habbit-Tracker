'use client';

import type { FieldProps } from './types';

export function LongTextField({ field, value, onChange }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.field_options.placeholder}
        rows={4}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-y"
      />
    </div>
  );
}
