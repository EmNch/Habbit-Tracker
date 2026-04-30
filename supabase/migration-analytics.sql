-- ============================================
-- MIGRATION: Adaugă analytics pe schema existentă
-- Rulează ÎNTREGUL script în Supabase SQL Editor
-- ============================================

-- 1. Adaugă coloana stats_cache la habits (dacă nu există)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'habits' AND column_name = 'stats_cache'
    ) THEN
        ALTER TABLE habits ADD COLUMN stats_cache JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Adaugă coloana is_completed la habit_entries (dacă nu există)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'habit_entries' AND column_name = 'is_completed'
    ) THEN
        ALTER TABLE habit_entries ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 3. Index pentru is_completed
CREATE INDEX IF NOT EXISTS idx_entries_completed ON habit_entries(user_id, is_completed) WHERE is_completed = true;

-- 4. Funcția compute_entry_completion (DROP + CREATE pentru a o actualiza)
DROP TRIGGER IF EXISTS trigger_compute_completion ON habit_entries;
DROP FUNCTION IF EXISTS compute_entry_completion();

CREATE OR REPLACE FUNCTION compute_entry_completion()
RETURNS TRIGGER AS $$
DECLARE
    required_keys TEXT[];
    val JSONB;
    all_filled BOOLEAN;
BEGIN
    SELECT ARRAY_AGG(field_key) INTO required_keys
    FROM habit_field_definitions
    WHERE habit_id = NEW.habit_id
      AND is_deleted = false
      AND is_required = true;

    IF required_keys IS NOT NULL AND ARRAY_LENGTH(required_keys, 1) > 0 THEN
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
        NEW.is_completed := (NEW.values != '{}');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_compute_completion
    BEFORE INSERT OR UPDATE OF values ON habit_entries
    FOR EACH ROW EXECUTE FUNCTION compute_entry_completion();

-- 5. Funcția refresh_habit_stats (DROP + CREATE pentru a o actualiza)
DROP TRIGGER IF EXISTS trigger_refresh_stats_insert ON habit_entries;
DROP TRIGGER IF EXISTS trigger_refresh_stats_update ON habit_entries;
DROP TRIGGER IF EXISTS trigger_refresh_stats_delete ON habit_entries;
DROP FUNCTION IF EXISTS refresh_habit_stats();

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
    -- Current streak
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

    -- Longest streak
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

    -- Total entries
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
    AFTER UPDATE OF values ON habit_entries FOR EACH ROW EXECUTE FUNCTION refresh_habit_stats();

CREATE TRIGGER trigger_refresh_stats_delete
    AFTER DELETE ON habit_entries FOR EACH ROW EXECUTE FUNCTION refresh_habit_stats();

-- ============================================
-- 6. BACKFILL: Marchează entry-urile existente ca completed
-- și recalculează stats pentru toate habits existente
-- ============================================

-- Temporarily disable triggers to avoid recursion during backfill
-- We update is_completed manually first
UPDATE habit_entries e
SET is_completed = (
    CASE
        WHEN EXISTS (
            SELECT 1 FROM habit_field_definitions f
            WHERE f.habit_id = e.habit_id
              AND f.is_deleted = false
              AND f.is_required = true
              AND (e.values->f.field_key IS NULL OR e.values->f.field_key = 'null'::jsonb)
        ) THEN false
        ELSE (e.values != '{}')
    END
);

-- Now recalculate stats for each habit
DO $$
DECLARE
    habit_record RECORD;
    v_current_streak INTEGER := 0;
    v_longest_streak INTEGER := 0;
    v_completion_rate_7d NUMERIC(5,2) := 0;
    v_completion_rate_30d NUMERIC(5,2) := 0;
    v_total_entries INTEGER := 0;
    v_last_entry_date DATE;
BEGIN
    FOR habit_record IN SELECT id FROM habits WHERE is_active = true LOOP
        -- Current streak
        WITH ranked AS (
            SELECT entry_date,
                   entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date DESC))::int AS grp
            FROM habit_entries
            WHERE habit_id = habit_record.id AND is_completed = true
        ),
        streaks AS (
            SELECT grp, COUNT(*) AS len, MAX(entry_date) AS end_date
            FROM ranked GROUP BY grp
        )
        SELECT COALESCE(MAX(len), 0) INTO v_current_streak
        FROM streaks
        WHERE end_date >= CURRENT_DATE - INTERVAL '1 day';

        -- Longest streak
        WITH ranked AS (
            SELECT entry_date,
                   entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS grp
            FROM habit_entries
            WHERE habit_id = habit_record.id AND is_completed = true
        ),
        streaks AS (
            SELECT grp, COUNT(*) AS len
            FROM ranked GROUP BY grp
        )
        SELECT COALESCE(MAX(len), 0) INTO v_longest_streak FROM streaks;

        -- 7d rate
        SELECT COALESCE(
            ROUND(COUNT(CASE WHEN is_completed THEN 1 END)::numeric / GREATEST(COUNT(*), 1) * 100, 1),
            0
        ) INTO v_completion_rate_7d
        FROM (SELECT CURRENT_DATE - generate_series(0, 6) AS d) days
        LEFT JOIN habit_entries e ON e.habit_id = habit_record.id AND e.entry_date = days.d;

        -- 30d rate
        SELECT COALESCE(
            ROUND(COUNT(CASE WHEN is_completed THEN 1 END)::numeric / GREATEST(COUNT(*), 1) * 100, 1),
            0
        ) INTO v_completion_rate_30d
        FROM (SELECT CURRENT_DATE - generate_series(0, 29) AS d) days
        LEFT JOIN habit_entries e ON e.habit_id = habit_record.id AND e.entry_date = days.d;

        -- Total
        SELECT COUNT(*), MAX(entry_date)
        INTO v_total_entries, v_last_entry_date
        FROM habit_entries
        WHERE habit_id = habit_record.id AND is_completed = true;

        -- Write stats
        UPDATE habits SET stats_cache = jsonb_build_object(
            'current_streak', v_current_streak,
            'longest_streak', v_longest_streak,
            'completion_rate_7d', v_completion_rate_7d,
            'completion_rate_30d', v_completion_rate_30d,
            'total_entries', v_total_entries,
            'last_entry_date', v_last_entry_date,
            'updated_at', now()
        )
        WHERE id = habit_record.id;
    END LOOP;
END $$;

-- Verificare
SELECT
    h.name,
    h.stats_cache->>'current_streak' AS streak,
    h.stats_cache->>'completion_rate_7d' AS rate_7d,
    h.stats_cache->>'total_entries' AS total
FROM habits h
WHERE h.is_active = true;
