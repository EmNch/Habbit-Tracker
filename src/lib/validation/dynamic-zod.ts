import { z, ZodTypeAny } from 'zod';
import type { HabitFieldDefinition, FieldType, FieldOptions } from '@/lib/types';

function fieldToZod(fieldType: FieldType, options: FieldOptions): ZodTypeAny {
  switch (fieldType) {
    case 'text':
      return z.string().transform((v) => v || null);
    case 'number':
      return z.number().min(options.min ?? -Infinity).max(options.max ?? Infinity);
    case 'rating':
      return z.number().int().min(1).max(5);
    case 'boolean':
      return z.boolean();
    case 'select':
      return options.options?.length
        ? z.enum(options.options as [string, ...string[]])
        : z.string().transform((v) => v || null);
    case 'slider':
      return z.number().min(options.min ?? 0).max(options.max ?? 100);
    case 'date':
      return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format dată invalid');
    case 'link':
      return z.string().url('URL invalid');
    case 'long_text':
      return z.string().transform((v) => v || null);
    default:
      return z.unknown();
  }
}

export function buildEntrySchema(fields: HabitFieldDefinition[]) {
  const activeFields = fields.filter((f) => !f.is_deleted);
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of activeFields) {
    let schema = fieldToZod(field.field_type, field.field_options);
    if (!field.is_required) {
      schema = schema.optional().nullable();
    }
    shape[field.field_key] = schema;
  }

  return z.object(shape);
}

export type EntrySchema = ReturnType<typeof buildEntrySchema>;
