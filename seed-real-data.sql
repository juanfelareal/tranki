-- SEED REAL DATA FOR USER: juanfelipeleonleon@gmail.com
-- Data extracted from local SQLite database

DO $$
DECLARE
  v_user_id UUID;
  -- Account IDs
  v_acc_efectivo BIGINT;
  v_acc_bancolombia BIGINT;
  v_acc_micelio BIGINT;
  v_acc_oro BIGINT;
  -- Custom Category IDs
  v_cat_ingresos_extra BIGINT;
  v_cat_la_real BIGINT;
  v_cat_ahorro_yolanda BIGINT;
  v_cat_aseo_margarita BIGINT;
  v_cat_casa_micelio BIGINT;
  v_cat_cuidado_personal BIGINT;
  v_cat_deuda_bambutic BIGINT;
  v_cat_gasolina BIGINT;
  v_cat_gimnasio BIGINT;
  v_cat_gratu BIGINT;
  v_cat_grupo_inversion BIGINT;
  v_cat_hobbies BIGINT;
  v_cat_mascotas BIGINT;
  v_cat_mercado BIGINT;
  v_cat_negocios BIGINT;
  v_cat_peajes BIGINT;
  v_cat_plan_datos BIGINT;
  v_cat_salidas BIGINT;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'juanfelipeleonleon@gmail.com';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User juanfelipeleonleon@gmail.com not found';
  END IF;

  -- ========== CREATE ACCOUNTS ==========
  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Efectivo', 'cash', 0, 'COP', '💵', '#6366F1')
  RETURNING id INTO v_acc_efectivo;

  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Cuenta ahorros Bancolombia - Juanfe', 'bank', 0, 'COP', '🏦', '#3B82F6')
  RETURNING id INTO v_acc_bancolombia;

  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Cuenta Ahorro Casa Micelio', 'bank', 0, 'COP', '🏦', '#3B82F6')
  RETURNING id INTO v_acc_micelio;

  INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
  VALUES (v_user_id, 'Ahorro Oro', 'investment', 0, 'COP', '💰', '#F59E0B')
  RETURNING id INTO v_acc_oro;

  -- ========== CREATE CUSTOM CATEGORIES ==========
  -- Income categories
  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Ingresos Extra', 'income', '💵', '#22C55E', false)
  RETURNING id INTO v_cat_ingresos_extra;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'LA REAL', 'income', '💰', '#10B981', false)
  RETURNING id INTO v_cat_la_real;

  -- Expense categories
  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Ahorro Yolanda', 'expense', '👩', '#8B5CF6', false)
  RETURNING id INTO v_cat_ahorro_yolanda;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Aseo casa - Margarita', 'expense', '🧹', '#EC4899', false)
  RETURNING id INTO v_cat_aseo_margarita;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Casa Micelio', 'expense', '🏠', '#F59E0B', false)
  RETURNING id INTO v_cat_casa_micelio;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Cuidado personal', 'expense', '💅', '#F472B6', false)
  RETURNING id INTO v_cat_cuidado_personal;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Deuda Bambutic', 'expense', '💳', '#EF4444', false)
  RETURNING id INTO v_cat_deuda_bambutic;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Gasolina', 'expense', '⛽', '#F97316', false)
  RETURNING id INTO v_cat_gasolina;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Gimnasio', 'expense', '🏋️', '#14B8A6', false)
  RETURNING id INTO v_cat_gimnasio;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'GRATU', 'expense', '🎓', '#6366F1', false)
  RETURNING id INTO v_cat_gratu;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Grupo Inversion Bucaramanga', 'expense', '📊', '#0EA5E9', false)
  RETURNING id INTO v_cat_grupo_inversion;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Hobbies', 'expense', '🎨', '#A855F7', false)
  RETURNING id INTO v_cat_hobbies;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Mascotas', 'expense', '🐾', '#78716C', false)
  RETURNING id INTO v_cat_mascotas;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Mercado', 'expense', '🛒', '#84CC16', false)
  RETURNING id INTO v_cat_mercado;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Negocios', 'expense', '💼', '#3B82F6', false)
  RETURNING id INTO v_cat_negocios;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Peajes y parqueaderos', 'expense', '🅿️', '#64748B', false)
  RETURNING id INTO v_cat_peajes;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Plan de datos', 'expense', '📱', '#0891B2', false)
  RETURNING id INTO v_cat_plan_datos;

  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  VALUES (v_user_id, 'Salidas', 'expense', '🍽️', '#DC2626', false)
  RETURNING id INTO v_cat_salidas;

  -- ========== CREATE TRANSACTIONS ==========
  -- January 5, 2025
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 89400, 'COMPRA EN TIENDA D1', v_cat_mercado, v_acc_bancolombia, '2025-01-05');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 25220, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-05');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 7.94, 'ABONO INTERESES AHORROS', v_cat_ingresos_extra, v_acc_bancolombia, '2025-01-05');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 25220, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-05');

  -- January 4, 2025
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 89000, 'TRANSF QR CAMILO ALFONSO HIGU', v_cat_salidas, v_acc_bancolombia, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 13820, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 658800, 'COMPRA EN ZARA HOME', v_cat_casa_micelio, v_acc_micelio, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 34000, 'COMPRA EN COLCHONES', v_cat_casa_micelio, v_acc_micelio, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 9.09, 'ABONO INTERESES AHORROS', v_cat_ingresos_extra, v_acc_bancolombia, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 25220, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-04');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 18020, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-04');

  -- January 3, 2025
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 34000, 'PAGO QR LA MORDIDA CA', v_cat_salidas, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 100000, 'COMPRA EN SERVICENTR', v_cat_gasolina, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 149900, 'COMPRA EN PAYU*SOLUC', NULL, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 27800, 'COMPRA EN ALTOQUE JO', v_cat_salidas, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 74078, 'COMPRA EN BC/LA CURV', v_cat_salidas, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 9.66, 'ABONO INTERESES AHORROS', v_cat_ingresos_extra, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 13820, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-03');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 13820, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-03');

  -- January 2, 2025
  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 13820, 'Pago electronico FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 45000, 'Compra en ALTOQUE JO', v_cat_salidas, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 66600, 'Compra en CREPES Y W', v_cat_salidas, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 600000, 'COMPRA EN FALABELLA', v_cat_casa_micelio, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 13820, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 100000, 'COMPRA EN SERVICENTR', v_cat_gasolina, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'expense', 18820, 'PAGO ELECTRONICO FLYPASS', v_cat_peajes, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 3600000, 'PAGO INTERBANC PAYU COLOMBIA S', v_cat_ingresos_extra, v_acc_bancolombia, '2025-01-02');

  INSERT INTO transactions (user_id, type, amount, description, category_id, account_id, date)
  VALUES (v_user_id, 'income', 5.9, 'ABONO INTERESES AHORROS', v_cat_ingresos_extra, v_acc_efectivo, '2025-01-02');

  -- ========== CREATE SNOWBALL DEBT ==========
  INSERT INTO snowball_debts (user_id, name, creditor, original_amount, current_balance, interest_rate, minimum_payment, due_day, status)
  VALUES (v_user_id, 'Deuda casa Micelio', 'Papas', 200000000, 200000000, 0, 1957000, 1, 'active');

  -- ========== CREATE CATEGORY RULES ==========
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'pago electronico flypass', v_cat_peajes);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'abono intereses ahorros', v_cat_ingresos_extra);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en tienda d1', v_cat_mercado);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en colchones', v_cat_casa_micelio);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en zara home', v_cat_casa_micelio);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'transf qr camilo alfonso higu', v_cat_salidas);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en bc/la curv', v_cat_salidas);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en altoque jo', v_cat_salidas);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en servicentr', v_cat_gasolina);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'pago qr la mordida ca', v_cat_salidas);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'pago interbanc payu colombia s', v_cat_ingresos_extra);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en falabella', v_cat_casa_micelio);
  INSERT INTO category_rules (user_id, keyword, category_id) VALUES (v_user_id, 'compra en crepes y w', v_cat_salidas);

  RAISE NOTICE 'Data seeded successfully for user %', v_user_id;
END $$;
