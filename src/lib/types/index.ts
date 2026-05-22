export type FieldType =
  | 'text'
  | 'number'
  | 'rating'
  | 'boolean'
  | 'select'
  | 'slider'
  | 'date'
  | 'link'
  | 'long_text'
  | 'time_duration';

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
  'time_duration',
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
  time_duration: 'Timp (Cronometru)',
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
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_timezone: string;
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
  discipline: DisciplineLevel;
}

export interface DisciplinePeriod {
  label: string;
  percent: number;
  completedEntries: number;
  expectedEntries: number;
  days: number;
}

export type DisciplineLevel = {
  periods: DisciplinePeriod[];
  firstEntryDate: string | null;
};

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

export type TargetFrequency = 'daily' | 'weekly' | 'monthly' | 'total';

export interface Target {
  id: string;
  user_id: string;
  habit_id: string | null;
  name: string;
  description: string;
  target_value: number;
  target_frequency: TargetFrequency;
  deadline: string | null;
  is_completed: boolean;
  completed_at: string | null;
  is_archived: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Personalities Types
// ============================================

export type PersonalityCategory = 'business' | 'arta' | 'stiinta' | 'sport' | 'tehnologie' | 'muzica' | 'film' | 'literatura' | 'filozofie' | 'general';

export const PERSONALITY_CATEGORIES: { value: PersonalityCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'arta', label: 'Artă' },
  { value: 'stiinta', label: 'Știință' },
  { value: 'sport', label: 'Sport' },
  { value: 'tehnologie', label: 'Tehnologie' },
  { value: 'muzica', label: 'Muzică' },
  { value: 'film', label: 'Film' },
  { value: 'literatura', label: 'Literatură' },
  { value: 'filozofie', label: 'Filozofie' },
];

export const PERSONALITY_ICONS = ['👤', '💼', '🎨', '🔬', '⚽', '💻', '🎵', '🎬', '📖', '🧠', '⭐', '🌟', '🔥', '💡', '🏆', '🚀'];

export interface Personality {
  id: string;
  user_id: string;
  name: string;
  notes: string;
  category: PersonalityCategory;
  link: string;
  icon: string;
  color: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalityArticle {
  id: string;
  user_id: string;
  personality_id: string;
  title: string;
  content: string;
  category: PersonalityCategory;
  source_link: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CategorySummary {
  id: string;
  user_id: string;
  category: PersonalityCategory;
  content: string;
  updated_at: string;
}

// ============================================
// Financial Types
// ============================================

export type FinancialEntryKind = 'income' | 'expense' | 'saving';

export interface FinancialEntry {
  id: string;
  user_id: string;
  kind: FinancialEntryKind;
  amount_cents: number;
  category: string;
  description: string;
  saving_goal_id: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface SavingGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount_cents: number;
  color: string;
  icon: string;
  deadline: string | null;
  is_completed: boolean;
  saved_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  creditor: string;
  total_amount_cents: number;
  paid_amount_cents: number;
  due_date: string | null;
  notes: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface DebtSummary {
  debts: Debt[];
  totalDebtCents: number;
  totalPaidCents: number;
  totalRemainingCents: number;
}

export interface FinancialSummary {
  totalBalanceCents: number;
  monthlyIncomeCents: number;
  monthlyExpenseCents: number;
  totalSavingsCents: number;
  debtSummary: DebtSummary;
}

export interface FinancialOverview {
  totalBalanceCents: number;
  monthlyIncomeCents: number;
  monthlyExpenseCents: number;
  monthlyProfitCents: number;
  debtSummary: DebtSummary;
}

export interface PushSubscriptionData {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}
