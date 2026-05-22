-- Financial tracking tables (replaces budget system)

-- Financial entries: income, expense, saving
CREATE TABLE financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense', 'saving')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  saving_goal_id UUID,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_financial_entries_user ON financial_entries(user_id);
CREATE INDEX idx_financial_entries_user_kind ON financial_entries(user_id, kind);
CREATE INDEX idx_financial_entries_date ON financial_entries(user_id, entry_date);
CREATE INDEX idx_financial_entries_goal ON financial_entries(saving_goal_id) WHERE saving_goal_id IS NOT NULL;

ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_entries_user_policy ON financial_entries
  FOR ALL USING (user_id = auth.uid());

-- Savings goals
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount_cents INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '🎯',
  deadline DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_savings_goals_user ON savings_goals(user_id);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY savings_goals_user_policy ON savings_goals
  FOR ALL USING (user_id = auth.uid());

-- FK from financial_entries to savings_goals
ALTER TABLE financial_entries
  ADD CONSTRAINT fk_saving_goal
  FOREIGN KEY (saving_goal_id) REFERENCES savings_goals(id) ON DELETE SET NULL;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_financial_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_entries_updated_at
  BEFORE UPDATE ON financial_entries
  FOR EACH ROW EXECUTE FUNCTION update_financial_entries_updated_at();

CREATE OR REPLACE FUNCTION update_savings_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_savings_goals_updated_at();
