'use client';

import type { FieldType, HabitFieldDefinition, EntryValues } from '@/lib/types';
import type { FieldProps } from './fields/types';
import { TextField } from './fields/text-field';
import { NumberField } from './fields/number-field';
import { RatingField } from './fields/rating-field';
import { BooleanField } from './fields/boolean-field';
import { SelectField } from './fields/select-field';
import { SliderField } from './fields/slider-field';
import { DateField } from './fields/date-field';
import { LinkField } from './fields/link-field';
import { LongTextField } from './fields/long-text-field';
import { TimeDurationField } from './fields/time-duration-field';

const FIELD_COMPONENTS: Record<FieldType, React.ComponentType<FieldProps>> = {
  text: TextField,
  number: NumberField,
  rating: RatingField,
  boolean: BooleanField,
  select: SelectField,
  slider: SliderField,
  date: DateField,
  link: LinkField,
  long_text: LongTextField,
  time_duration: TimeDurationField,
};

interface DynamicFormProps {
  fields: HabitFieldDefinition[];
  values: EntryValues;
  onChange: (key: string, value: string | number | boolean | null) => void;
}

export function DynamicForm({ fields, values, onChange }: DynamicFormProps) {
  const activeFields = fields
    .filter((f) => !f.is_deleted)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (activeFields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          Nu ai definit câmpuri pentru acest obicei.
        </p>
        <p className="text-xs mt-1">
          Editează obiceiul pentru a adăuga câmpuri personalizate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeFields.map((field) => {
        const Component = FIELD_COMPONENTS[field.field_type];
        if (!Component) return null;

        return (
          <Component
            key={field.id}
            field={field}
            value={(values[field.field_key] as string | number | boolean | null) ?? null}
            onChange={(value) => onChange(field.field_key, value)}
          />
        );
      })}
    </div>
  );
}
