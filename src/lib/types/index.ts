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
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Budget Types
// ============================================

export type BudgetCategoryKind = 'expense' | 'income';

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  kind: BudgetCategoryKind;
  monthly_limit_cents: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount_cents: number;
  kind: BudgetCategoryKind;
  note: string;
  transaction_date: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: BudgetCategory;
}

export interface CategoryBudget {
  category: BudgetCategory;
  spent_cents: number;
  limit_cents: number | null;
  percent: number;
  status: 'safe' | 'normal' | 'warning' | 'danger';
}

export interface MonthlyBudgetOverview {
  total_planned_cents: number;
  total_spent_cents: number;
  total_income_cents: number;
  remaining_cents: number;
  daily_budget_cents: number;
  spending_percent: number;
  days_in_month: number;
  days_elapsed: number;
  days_remaining: number;
}

export interface BudgetInsight {
  category_id: string;
  category_name: string;
  category_icon: string;
  projected_overspend_cents: number;
  days_until_limit: number | null;
  severity: 'ok' | 'caution' | 'warning' | 'critical';
}

export interface MonthlyTrend {
  month: string;
  income_cents: number;
  expense_cents: number;
  balance_cents: number;
}

export interface DailySpending {
  date: string;
  day: number;
  amount_cents: number;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  category_id: string;
  amount_cents: number;
  kind: BudgetCategoryKind;
  note: string;
  frequency: 'monthly';
  day_of_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringTemplateWithCategory extends RecurringTemplate {
  category: BudgetCategory;
}

export interface BudgetSummary {
  total_income_cents: number;
  total_expense_cents: number;
  balance_cents: number;
  categories: CategoryBudget[];
  overview: MonthlyBudgetOverview;
  insights: BudgetInsight[];
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
