-- Migration: Add reminders & push notifications support
-- Run this in the Supabase SQL Editor

-- 1. Add reminder columns to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reminder_time TIME;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reminder_timezone TEXT NOT NULL DEFAULT 'Europe/Bucharest';

-- 2. Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

-- 3. Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Trigger to auto-update updated_at on push_subscriptions
CREATE OR REPLACE FUNCTION update_push_sub_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_push_sub_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_sub_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_sub_updated_at();

-- 5. pg_cron: invoke Edge Function every minute to send reminders
-- NOTE: Replace <YOUR_PROJECT_REF> with your actual Supabase project ref
-- Uncomment and run after deploying the Edge Function:
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- SELECT cron.schedule(
--     'send-habit-reminders',
--     '* * * * *',
--     $$
--     SELECT net.http_post(
--         url := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-reminders',
--         headers := jsonb_build_object(
--             'Content-Type', 'application/json',
--             'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--         ),
--         body := '{}'::jsonb
--     );
--     $$
-- );
