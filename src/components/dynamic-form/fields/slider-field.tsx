'use client';

import type { FieldProps } from './types';

export function SliderField({ field, value, onChange }: FieldProps) {
  const min = field.field_options.min ?? 0;
  const max = field.field_options.max ?? 10;
  const step = field.field_options.step ?? 1;
  const val = (value as number) ?? min;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-right">
          {val}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
