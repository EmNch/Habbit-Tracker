'use client';

import { Star } from 'lucide-react';
import type { FieldProps } from './types';

export function RatingField({ field, value, onChange }: FieldProps) {
  const rating = (value as number) ?? 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === rating ? null : star)}
            className="p-1 transition"
          >
            <Star
              className={`w-7 h-7 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
