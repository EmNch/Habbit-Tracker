-- Migration: Add targets as a separate entity
-- Run this in the Supabase SQL Editor

-- 1. Remove target columns from habits (they were never in schema.sql,
--    only added to the DB via the previous migration if already run)
ALTER TABLE habits DROP COLUMN IF EXISTS target_value;
ALTER TABLE habits DROP COLUMN IF EXISTS target_frequency;
ALTER TABLE habits DROP COLUMN IF EXISTS target_deadline;

-- 2. Create targets table
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    target_value INTEGER NOT NULL,
    target_frequency TEXT NOT NULL CHECK (target_frequency IN ('daily', 'weekly', 'monthly', 'total')),
    deadline DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT DEFAULT '🎯',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_targets_user ON targets(user_id);
CREATE INDEX idx_targets_habit ON targets(habit_id);
CREATE INDEX idx_targets_deadline ON targets(deadline) WHERE deadline IS NOT NULL AND is_completed = false;

-- 3. Enable RLS
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own targets" ON targets
    FOR ALL USING (auth.uid() = user_id);

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_target_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_target_updated_at
    BEFORE UPDATE ON targets
    FOR EACH ROW
    EXECUTE FUNCTION update_target_updated_at();
