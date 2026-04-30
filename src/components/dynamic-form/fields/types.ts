import type { HabitFieldDefinition } from '@/lib/types';

export interface FieldProps {
  field: HabitFieldDefinition;
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null) => void;
}
