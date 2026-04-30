-- ============================================
-- Habit Tracker Dynamic - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Habits
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    cover_image_url TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT DEFAULT '📋',
    is_active BOOLEAN NOT NULL DEFAULT true,
    stats_cache JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habit Field Definitions (dynamic schema)
CREATE TABLE habit_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN (
        'text', 'number', 'rating', 'boolean', 'select',
        'slider', 'date', 'link', 'long_text'
    )),
    field_options JSONB DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(habit_id, field_key)
);

-- 3. Habit Entries (daily entries with JSONB values)
CREATE TABLE habit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    values JSONB NOT NULL DEFAULT '{}',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(habit_id, entry_date)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_hfd_habit ON habit_field_definitions(habit_id) WHERE is_deleted = false;
CREATE INDEX idx_entries_habit_date ON habit_entries(habit_id, entry_date);
CREATE INDEX idx_entries_user_date ON habit_entries(user_id, entry_date);
CREATE INDEX idx_entries_values ON habit_entries USING GIN (values);
CREATE INDEX idx_entries_completed ON habit_entries(user_id, is_completed) WHERE is_completed = true;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;

-- Habits
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Habit Field Definitions
CREATE POLICY "Users can view own field definitions" ON habit_field_definitions FOR SELECT
    USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_field_definitions.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can create own field definitions" ON habit_field_definitions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_field_definitions.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can update own field definitions" ON habit_field_definitions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_field_definitions.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can delete own field definitions" ON habit_field_definitions FOR DELETE
    USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_field_definitions.habit_id AND habits.user_id = auth.uid()));

-- Habit Entries
CREATE POLICY "Users can view own entries" ON habit_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own entries" ON habit_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON habit_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON habit_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Helper: updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER habit_field_definitions_updated_at BEFORE UPDATE ON habit_field_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER habit_entries_updated_at BEFORE UPDATE ON habit_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Function: Compute is_completed for an entry
-- An entry is "completed" when ALL required fields have non-null values.
-- If no required fields exist, any non-empty values count.
-- ============================================
CREATE OR REPLACE FUNCTION compute_entry_completion()
RETURNS TRIGGER AS $$
DECLARE
    required_keys TEXT[];
    val JSONB;
    all_filled BOOLEAN;
BEGIN
    -- Get required field keys for this habit
    SELECT ARRAY_AGG(field_key) INTO required_keys
    FROM habit_field_definitions
    WHERE habit_id = NEW.habit_id
      AND is_deleted = false
      AND is_required = true;

    IF required_keys IS NOT NULL AND ARRAY_LENGTH(required_keys, 1) > 0 THEN
        -- Check all required keys have non-null values
        all_filled := true;
        FOR i IN 1..ARRAY_LENGTH(required_keys, 1) LOOP
            val := NEW.values->required_keys[i];
            IF val IS NULL OR val = 'null'::jsonb THEN
                all_filled := false;
                EXIT;
            END IF;
        END LOOP;
        NEW.is_completed := all_filled;
    ELSE
        -- No required fields: completed if values is not empty
        NEW.is_completed := (NEW.values != '{}');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_compute_completion
    BEFORE INSERT OR UPDATE OF values ON habit_entries
    FOR EACH ROW EXECUTE FUNCTION compute_entry_completion();

-- ============================================
-- Function: Refresh stats_cache for a habit
-- Called after entry insert/update/delete
-- ============================================
CREATE OR REPLACE FUNCTION refresh_habit_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_current_streak INTEGER := 0;
    v_longest_streak INTEGER := 0;
    v_completion_rate_7d NUMERIC(5,2) := 0;
    v_completion_rate_30d NUMERIC(5,2) := 0;
    v_total_entries INTEGER := 0;
    v_last_entry_date DATE;
BEGIN
    -- Current streak (consecutive completed days ending today or yesterday)
    WITH ranked AS (
        SELECT entry_date,
               entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date DESC))::int AS grp
        FROM habit_entries
        WHERE habit_id = NEW.habit_id AND is_completed = true
    ),
    streaks AS (
        SELECT grp, COUNT(*) AS len, MAX(entry_date) AS end_date
        FROM ranked GROUP BY grp
    )
    SELECT COALESCE(MAX(len), 0) INTO v_current_streak
    FROM streaks
    WHERE end_date >= CURRENT_DATE - INTERVAL '1 day';

    -- Longest streak ever
    WITH ranked AS (
        SELECT entry_date,
               entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS grp
        FROM habit_entries
        WHERE habit_id = NEW.habit_id AND is_completed = true
    ),
    streaks AS (
        SELECT grp, COUNT(*) AS len
        FROM ranked GROUP BY grp
    )
    SELECT COALESCE(MAX(len), 0) INTO v_longest_streak FROM streaks;

    -- Completion rate last 7 days
    SELECT COALESCE(
        ROUND(COUNT(CASE WHEN is_completed THEN 1 END)::numeric / GREATEST(COUNT(*), 1) * 100, 1),
        0
    ) INTO v_completion_rate_7d
    FROM (
        SELECT CURRENT_DATE - generate_series(0, 6) AS d
    ) days
    LEFT JOIN habit_entries e ON e.habit_id = NEW.habit_id AND e.entry_date = days.d;

    -- Completion rate last 30 days
    SELECT COALESCE(
        ROUND(COUNT(CASE WHEN is_completed THEN 1 END)::numeric / GREATEST(COUNT(*), 1) * 100, 1),
        0
    ) INTO v_completion_rate_30d
    FROM (
        SELECT CURRENT_DATE - generate_series(0, 29) AS d
    ) days
    LEFT JOIN habit_entries e ON e.habit_id = NEW.habit_id AND e.entry_date = days.d;

    -- Total entries and last entry date
    SELECT COUNT(*), MAX(entry_date)
    INTO v_total_entries, v_last_entry_date
    FROM habit_entries
    WHERE habit_id = NEW.habit_id AND is_completed = true;

    -- Update stats_cache
    UPDATE habits SET stats_cache = jsonb_build_object(
        'current_streak', v_current_streak,
        'longest_streak', v_longest_streak,
        'completion_rate_7d', v_completion_rate_7d,
        'completion_rate_30d', v_completion_rate_30d,
        'total_entries', v_total_entries,
        'last_entry_date', v_last_entry_date,
        'updated_at', now()
    )
    WHERE id = NEW.habit_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_stats_insert
    AFTER INSERT ON habit_entries FOR EACH ROW EXECUTE FUNCTION refresh_habit_stats();

CREATE TRIGGER trigger_refresh_stats_update
    AFTER UPDATE OF values, is_completed ON habit_entries FOR EACH ROW EXECUTE FUNCTION refresh_habit_stats();

CREATE TRIGGER trigger_refresh_stats_delete
    AFTER DELETE ON habit_entries FOR EACH ROW EXECUTE FUNCTION refresh_habit_stats();
