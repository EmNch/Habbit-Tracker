-- Debts table: track debts with due dates and partial payments
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  creditor TEXT DEFAULT '',
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  paid_amount_cents INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  notes TEXT DEFAULT '',
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX idx_debts_user_id ON debts(user_id);

-- RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY debts_user_policy ON debts
  FOR ALL USING (user_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_debts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_debts_updated_at();
