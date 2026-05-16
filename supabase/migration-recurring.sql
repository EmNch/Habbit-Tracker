-- Recurring transaction templates
CREATE TABLE IF NOT EXISTS recurring_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  kind TEXT NOT NULL CHECK (kind IN ('expense', 'income')),
  note TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly')),
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 28),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup per user
CREATE INDEX IF NOT EXISTS idx_recurring_templates_user ON recurring_templates(user_id);

-- RLS
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recurring templates" ON recurring_templates
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_recurring_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON recurring_templates;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON recurring_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_templates_updated_at();
