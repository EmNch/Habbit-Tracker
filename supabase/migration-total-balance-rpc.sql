-- RPC function for total balance aggregation
-- Replaces fetching all transactions and summing in JS
CREATE OR REPLACE FUNCTION get_total_balance(p_user_id UUID)
RETURNS TABLE(income BIGINT, expense BIGINT, balance BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(SUM(amount_cents) FILTER (WHERE kind = 'income'), 0) AS income,
    COALESCE(SUM(amount_cents) FILTER (WHERE kind = 'expense'), 0) AS expense,
    COALESCE(SUM(amount_cents) FILTER (WHERE kind = 'income'), 0) -
    COALESCE(SUM(amount_cents) FILTER (WHERE kind = 'expense'), 0) AS balance
  FROM transactions
  WHERE user_id = p_user_id;
$$;
