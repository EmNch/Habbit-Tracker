export type FieldType =
  | 'text'
  | 'number'
  | 'rating'
  | 'boolean'
  | 'select'
  | 'slider'
  | 'date'
  | 'link'
  | 'long_text';

export const FIELD_TYPES: FieldType[] = [
  'text',
  'number',
  'rating',
  'boolean',
  'select',
  'slider',
  'date',
  'link',
  'long_text',
];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  number: 'Număr',
  rating: 'Rating (1-5)',
  boolean: 'Toggle (Da/Nu)',
  select: 'Select (Dropdown)',
  slider: 'Slider (Range)',
  date: 'Dată',
  link: 'Link (URL)',
  long_text: 'Text Lung (Markdown)',
};

export interface FieldOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  placeholder?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  stats_cache: HabitStatsCache | null;
  created_at: string;
  updated_at: string;
}

export interface HabitFieldDefinition {
  id: string;
  habit_id: string;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  field_options: FieldOptions;
  sort_order: number;
  is_required: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  values: Record<string, unknown>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitWithFields extends Habit {
  field_definitions: HabitFieldDefinition[];
}

export type EntryValues = Record<string, string | number | boolean | null>;

// ============================================
// Analytics Types
// ============================================

export interface HabitStatsCache {
  current_streak: number;
  longest_streak: number;
  completion_rate_7d: number;
  completion_rate_30d: number;
  total_entries: number;
  last_entry_date: string | null;
  updated_at: string;
}

export interface DashboardSummary {
  totalHabits: number;
  completedToday: number;
  currentGlobalStreak: number;
  bestHabitStreak: number;
  completionRateToday: number;
  heatmapData: HeatmapDay[];
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HabitWithStats extends Habit {
  todayCompleted: boolean;
  todayEntryExists: boolean;
}

export interface FieldAggregation {
  field_key: string;
  field_label: string;
  field_type: FieldType;
  values: Array<{ date: string; value: unknown }>;
}

export type TimeRange = '7d' | '30d' | '90d';
