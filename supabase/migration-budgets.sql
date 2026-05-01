-- Migration: Budgets module
-- Run this in the Supabase SQL Editor

-- 1. Budget Categories
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📦',
    color TEXT NOT NULL DEFAULT '#6366f1',
    kind TEXT NOT NULL CHECK (kind IN ('expense', 'income')),
    monthly_limit_cents INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_budget_cats_user ON budget_categories(user_id);

ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own categories" ON budget_categories
    FOR ALL USING (auth.uid() = user_id);

-- 2. Transactions (amounts in cents — INTEGER, never float)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    kind TEXT NOT NULL CHECK (kind IN ('expense', 'income')),
    note TEXT DEFAULT '',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trans_user ON transactions(user_id);
CREATE INDEX idx_trans_category ON transactions(category_id);
CREATE INDEX idx_trans_date ON transactions(user_id, transaction_date);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

-- 3. Triggers updated_at
CREATE OR REPLACE FUNCTION update_budget_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_budget_cats_upd
    BEFORE UPDATE ON budget_categories
    FOR EACH ROW EXECUTE FUNCTION update_budget_updated_at();

CREATE TRIGGER trg_transactions_upd
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_budget_updated_at();
