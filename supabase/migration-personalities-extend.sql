-- Migration: Extend personalities with images, articles, and category summaries
-- Run this in the Supabase SQL Editor

-- 1. Add image_url to personalities
ALTER TABLE personalities ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create personality_articles table
CREATE TABLE personality_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    personality_id UUID NOT NULL REFERENCES personalities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('business', 'arta', 'stiinta', 'sport', 'tehnologie', 'muzica', 'film', 'literatura', 'filozofie', 'general')),
    source_link TEXT NOT NULL DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_user ON personality_articles(user_id);
CREATE INDEX idx_articles_personality ON personality_articles(personality_id);
CREATE INDEX idx_articles_category ON personality_articles(user_id, category);

ALTER TABLE personality_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own articles" ON personality_articles
    FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_updated_at
    BEFORE UPDATE ON personality_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_article_updated_at();

-- 3. Create category_summaries table
CREATE TABLE category_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('business', 'arta', 'stiinta', 'sport', 'tehnologie', 'muzica', 'film', 'literatura', 'filozofie', 'general')),
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, category)
);

ALTER TABLE category_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own summaries" ON category_summaries
    FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_summary_updated_at
    BEFORE UPDATE ON category_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_summary_updated_at();

-- 4. Storage bucket for personality images
-- Run in Supabase Dashboard: Storage > New Bucket > Name: "personality-images" > Public: ON
-- Or run this:
INSERT INTO storage.buckets (id, name, public) VALUES ('personality-images', 'personality-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'personality-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'personality-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE USING (bucket_id = 'personality-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view personality images" ON storage.objects
    FOR SELECT USING (bucket_id = 'personality-images');
