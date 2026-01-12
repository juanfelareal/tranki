-- SEED DATA FOR USER: juanfelipeleonleon@gmail.com
-- Run this in Supabase SQL Editor

-- Get user ID
DO $$
DECLARE
  v_user_id UUID;
  v_account_efectivo_id BIGINT;
  v_account_banco_id BIGINT;
  v_account_ahorros_id BIGINT;
  v_cat_salario_id BIGINT;
  v_cat_freelance_id BIGINT;
  v_cat_alimentacion_id BIGINT;
  v_cat_transporte_id BIGINT;
  v_cat_servicios_id BIGINT;
  v_cat_entretenimiento_id BIGINT;
  v_cat_cafe_id BIGINT;
  v_cat_suscripciones_id BIGINT;
  v_cat_compras_id BIGINT;
  v_cat_salud_id BIGINT;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'juanfelipeleonleon@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get category IDs (default categories)
  SELECT id INTO v_cat_salario_id FROM categories WHERE name = 'Salario' AND is_default = true;
  SELECT id INTO v_cat_freelance_id FROM categories WHERE name = 'Freelance' AND is_default = true;
  SELECT id INTO v_cat_alimentacion_id FROM categories WHERE name = 'Alimentación' AND is_default = true;
  SELECT id INTO v_cat_transporte_id FROM categories WHERE name = 'Transporte' AND is_default = true;
  SELECT id INTO v_cat_servicios_id FROM categories WHERE name = 'Servicios' AND is_default = true;
  SELECT id INTO v_cat_entretenimiento_id FROM categories WHERE name = 'Entretenimiento' AND is_default = true;
  SELECT id INTO v_cat_cafe_id FROM categories WHERE name = 'Café' AND is_default = true;
  SELECT id INTO v_cat_suscripciones_id FROM categories WHERE name = 'Suscripciones' AND is_default = true;
  SELECT id INTO v_cat_compras_id FROM categories WHERE name = 'Compras' AND is_default = true;
  SELECT id INTO v_cat_salud_id FROM categories WHERE name = 'Salud' AND is_default = true;

  -- Create accounts
  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Efectivo', 'cash', 250000, 'COP', '💵', '#22C55E')
  RETURNING id INTO v_account_efectivo_id;

  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Bancolombia', 'bank', 3500000, 'COP', '🏦', '#6366F1')
  RETURNING id INTO v_account_banco_id;

  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Ahorros', 'savings', 5000000, 'COP', '🐷', '#F59E0B')
  RETURNING id INTO v_account_ahorros_id;

  -- TRANSACTIONS - December 2024
  -- Income
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 5500000, 'Salario Diciembre', v_cat_salario_id, v_account_banco_id, '2024-12-01');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 800000, 'Proyecto freelance web', v_cat_freelance_id, v_account_banco_id, '2024-12-15');

  -- Expenses December
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 45000, 'Rappi - Almuerzo', v_cat_alimentacion_id, v_account_banco_id, '2024-12-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 120000, 'Mercado Exito', v_cat_alimentacion_id, v_account_banco_id, '2024-12-05');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 85000, 'Uber mes', v_cat_transporte_id, v_account_banco_id, '2024-12-06');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 180000, 'Servicios EPM', v_cat_servicios_id, v_account_banco_id, '2024-12-10');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 55000, 'Netflix + Spotify', v_cat_suscripciones_id, v_account_banco_id, '2024-12-12');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 12000, 'Juan Valdez', v_cat_cafe_id, v_account_efectivo_id, '2024-12-14');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 250000, 'Cena navidad familia', v_cat_entretenimiento_id, v_account_banco_id, '2024-12-24');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 350000, 'Regalos navidad', v_cat_compras_id, v_account_banco_id, '2024-12-23');

  -- TRANSACTIONS - January 2025
  -- Income
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 5500000, 'Salario Enero', v_cat_salario_id, v_account_banco_id, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 1200000, 'Proyecto app movil', v_cat_freelance_id, v_account_banco_id, '2025-01-10');

  -- Expenses January
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 150000, 'Mercado semanal', v_cat_alimentacion_id, v_account_banco_id, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 38000, 'Domicilios Rappi', v_cat_alimentacion_id, v_account_banco_id, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 65000, 'Gasolina', v_cat_transporte_id, v_account_efectivo_id, '2025-01-05');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 55000, 'Netflix + Spotify', v_cat_suscripciones_id, v_account_banco_id, '2025-01-06');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 8500, 'Tostao cafe', v_cat_cafe_id, v_account_efectivo_id, '2025-01-06');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 180000, 'Servicios EPM', v_cat_servicios_id, v_account_banco_id, '2025-01-08');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 75000, 'Cine con amigos', v_cat_entretenimiento_id, v_account_efectivo_id, '2025-01-11');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 120000, 'Consulta medica', v_cat_salud_id, v_account_banco_id, '2025-01-13');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 42000, 'Almuerzo restaurante', v_cat_alimentacion_id, v_account_banco_id, '2025-01-14');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 95000, 'Uber semana', v_cat_transporte_id, v_account_banco_id, '2025-01-15');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 280000, 'Ropa Falabella', v_cat_compras_id, v_account_banco_id, '2025-01-18');

  -- Create monthly budget for January 2025
  INSERT INTO monthly_budgets (user_id, total_budget, month, year)
  VALUES (v_user_id, 3500000, 1, 2025);

  -- Create category budgets
  INSERT INTO budgets (user_id, category_id, amount, month, year)
  VALUES
    (v_user_id, v_cat_alimentacion_id, 800000, 1, 2025),
    (v_user_id, v_cat_transporte_id, 400000, 1, 2025),
    (v_user_id, v_cat_servicios_id, 300000, 1, 2025),
    (v_user_id, v_cat_entretenimiento_id, 300000, 1, 2025),
    (v_user_id, v_cat_suscripciones_id, 100000, 1, 2025),
    (v_user_id, v_cat_compras_id, 500000, 1, 2025),
    (v_user_id, v_cat_cafe_id, 100000, 1, 2025);

  -- Create a sample debt (Snowball)
  INSERT INTO snowball_debts (user_id, name, creditor, original_amount, current_balance, interest_rate, minimum_payment, due_day, status)
  VALUES (v_user_id, 'Tarjeta de credito', 'Bancolombia', 2500000, 1800000, 28.5, 150000, 15, 'active');

  RAISE NOTICE 'Data seeded successfully for user %', v_user_id;
END $$;
