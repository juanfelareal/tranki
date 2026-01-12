-- =====================================================
-- TRANKI: Migracion de Autenticacion y Seguridad
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Eliminar datos existentes (no tienen user_id)
-- Los usuarios crearan sus propios datos al registrarse
DELETE FROM debt_payments;
DELETE FROM snowball_debts;
DELETE FROM ai_insights;
DELETE FROM category_rules;
DELETE FROM settings;
DELETE FROM monthly_budgets;
DELETE FROM budgets;
DELETE FROM transactions;
DELETE FROM accounts;
-- Las categorias por defecto las mantenemos pero actualizamos

-- PASO 2: Agregar columna user_id a todas las tablas
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE monthly_budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE category_rules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE snowball_debts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE debt_payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- PASO 3: Crear indices para performance
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user ON monthly_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_snowball_debts_user ON snowball_debts(user_id);
CREATE INDEX IF NOT EXISTS idx_category_rules_user ON category_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_user ON debt_payments(user_id);

-- PASO 4: Habilitar Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE snowball_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- PASO 5: Politicas RLS para ACCOUNTS
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 6: Politicas RLS para TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 7: Politicas RLS para CATEGORIES (especial: defaults + custom)
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Los usuarios pueden ver categorias por defecto (user_id IS NULL) O sus propias categorias
CREATE POLICY "Users can view categories" ON categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 8: Politicas RLS para BUDGETS
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 9: Politicas RLS para MONTHLY_BUDGETS
DROP POLICY IF EXISTS "Users can view own monthly_budgets" ON monthly_budgets;
DROP POLICY IF EXISTS "Users can insert own monthly_budgets" ON monthly_budgets;
DROP POLICY IF EXISTS "Users can update own monthly_budgets" ON monthly_budgets;
DROP POLICY IF EXISTS "Users can delete own monthly_budgets" ON monthly_budgets;

CREATE POLICY "Users can view own monthly_budgets" ON monthly_budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monthly_budgets" ON monthly_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly_budgets" ON monthly_budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own monthly_budgets" ON monthly_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 10: Politicas RLS para AI_INSIGHTS
DROP POLICY IF EXISTS "Users can view own ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can insert own ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can delete own ai_insights" ON ai_insights;

CREATE POLICY "Users can view own ai_insights" ON ai_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_insights" ON ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_insights" ON ai_insights
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 11: Politicas RLS para CATEGORY_RULES
DROP POLICY IF EXISTS "Users can view own category_rules" ON category_rules;
DROP POLICY IF EXISTS "Users can insert own category_rules" ON category_rules;
DROP POLICY IF EXISTS "Users can update own category_rules" ON category_rules;
DROP POLICY IF EXISTS "Users can delete own category_rules" ON category_rules;

CREATE POLICY "Users can view own category_rules" ON category_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own category_rules" ON category_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own category_rules" ON category_rules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own category_rules" ON category_rules
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 12: Politicas RLS para SETTINGS
DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON settings;

CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 13: Politicas RLS para SNOWBALL_DEBTS
DROP POLICY IF EXISTS "Users can view own snowball_debts" ON snowball_debts;
DROP POLICY IF EXISTS "Users can insert own snowball_debts" ON snowball_debts;
DROP POLICY IF EXISTS "Users can update own snowball_debts" ON snowball_debts;
DROP POLICY IF EXISTS "Users can delete own snowball_debts" ON snowball_debts;

CREATE POLICY "Users can view own snowball_debts" ON snowball_debts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snowball_debts" ON snowball_debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snowball_debts" ON snowball_debts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snowball_debts" ON snowball_debts
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 14: Politicas RLS para DEBT_PAYMENTS
DROP POLICY IF EXISTS "Users can view own debt_payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can insert own debt_payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can delete own debt_payments" ON debt_payments;

CREATE POLICY "Users can view own debt_payments" ON debt_payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debt_payments" ON debt_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own debt_payments" ON debt_payments
  FOR DELETE USING (auth.uid() = user_id);

-- PASO 15: Actualizar categorias por defecto (user_id = NULL para que sean visibles para todos)
UPDATE categories SET user_id = NULL WHERE is_default = true;

-- PASO 16: Actualizar constraint unico en budgets para incluir user_id
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_category_id_month_year_key;
ALTER TABLE budgets ADD CONSTRAINT budgets_user_category_month_year_key
  UNIQUE (user_id, category_id, month, year);

-- PASO 17: Actualizar constraint unico en monthly_budgets para incluir user_id
ALTER TABLE monthly_budgets DROP CONSTRAINT IF EXISTS monthly_budgets_month_year_key;
ALTER TABLE monthly_budgets ADD CONSTRAINT monthly_budgets_user_month_year_key
  UNIQUE (user_id, month, year);

-- =====================================================
-- FIN DE LA MIGRACION
-- =====================================================
