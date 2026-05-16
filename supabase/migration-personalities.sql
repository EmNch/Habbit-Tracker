-- Migration: Add personalities table
-- Run this in the Supabase SQL Editor

CREATE TABLE personalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('business', 'arta', 'stiinta', 'sport', 'tehnologie', 'muzica', 'film', 'literatura', 'filozofie', 'general')),
    link TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT '👤',
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_personalities_user ON personalities(user_id);
CREATE INDEX idx_personalities_category ON personalities(user_id, category);

ALTER TABLE personalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personalities" ON personalities
    FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_personality_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personality_updated_at
    BEFORE UPDATE ON personalities
    FOR EACH ROW
    EXECUTE FUNCTION update_personality_updated_at();
