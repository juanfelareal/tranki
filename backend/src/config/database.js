import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../../tranki.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export const initializeDatabase = () => {
  // Accounts (for future multi-account support)
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'cash',
      balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'COP',
      icon TEXT DEFAULT '💰',
      color TEXT DEFAULT '#6366F1',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add color column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE accounts ADD COLUMN color TEXT DEFAULT '#6366F1'`);
  } catch (e) {
    // Column already exists
  }

  // Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT,
      color TEXT DEFAULT '#6366F1',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      description TEXT,
      category_id INTEGER,
      account_id INTEGER DEFAULT 1,
      date TEXT NOT NULL,
      receipt_url TEXT,
      voice_note_url TEXT,
      ai_extracted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    )
  `);

  // Budgets (per category)
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(category_id, month, year)
    )
  `);

  // Monthly Budget (overall)
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_budget REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(month, year)
    )
  `);

  // AI Insights (cached)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      month INTEGER,
      year INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Category Rules (auto-categorization)
  db.exec(`
    CREATE TABLE IF NOT EXISTS category_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Snowball Debts
  db.exec(`
    CREATE TABLE IF NOT EXISTS snowball_debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      creditor TEXT,
      original_amount REAL NOT NULL,
      current_balance REAL NOT NULL,
      interest_rate REAL DEFAULT 0,
      minimum_payment REAL DEFAULT 0,
      due_day INTEGER,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paid_off')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Debt Payments
  db.exec(`
    CREATE TABLE IF NOT EXISTS debt_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debt_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (debt_id) REFERENCES snowball_debts(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(year, month);
    CREATE INDEX IF NOT EXISTS idx_category_rules_keyword ON category_rules(keyword);
    CREATE INDEX IF NOT EXISTS idx_snowball_debts_status ON snowball_debts(status);
    CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments(debt_id);
  `);

  // Insert default account if not exists
  const defaultAccount = db.prepare('SELECT id FROM accounts WHERE id = 1').get();
  if (!defaultAccount) {
    db.prepare(`
      INSERT INTO accounts (name, type, balance, currency, icon)
      VALUES ('Efectivo', 'cash', 0, 'COP', '💵')
    `).run();
  }

  // Insert default categories if not exist
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count === 0) {
    const defaultCategories = [
      // Income categories
      { name: 'Salario', type: 'income', icon: '💼', color: '#22C55E' },
      { name: 'Freelance', type: 'income', icon: '💻', color: '#10B981' },
      { name: 'Inversiones', type: 'income', icon: '📈', color: '#14B8A6' },
      { name: 'Regalos', type: 'income', icon: '🎁', color: '#06B6D4' },
      { name: 'Otros Ingresos', type: 'income', icon: '💰', color: '#0EA5E9' },
      // Expense categories
      { name: 'Alimentación', type: 'expense', icon: '🍽️', color: '#EF4444' },
      { name: 'Transporte', type: 'expense', icon: '🚗', color: '#F97316' },
      { name: 'Vivienda', type: 'expense', icon: '🏠', color: '#F59E0B' },
      { name: 'Servicios', type: 'expense', icon: '💡', color: '#EAB308' },
      { name: 'Entretenimiento', type: 'expense', icon: '🎮', color: '#84CC16' },
      { name: 'Salud', type: 'expense', icon: '🏥', color: '#8B5CF6' },
      { name: 'Educación', type: 'expense', icon: '📚', color: '#A855F7' },
      { name: 'Compras', type: 'expense', icon: '🛍️', color: '#EC4899' },
      { name: 'Café', type: 'expense', icon: '☕', color: '#78716C' },
      { name: 'Suscripciones', type: 'expense', icon: '📱', color: '#6366F1' },
      { name: 'Otros Gastos', type: 'expense', icon: '📦', color: '#71717A' },
    ];

    const insertCategory = db.prepare(`
      INSERT INTO categories (name, type, icon, color, is_default)
      VALUES (?, ?, ?, ?, 1)
    `);

    defaultCategories.forEach(cat => {
      insertCategory.run(cat.name, cat.type, cat.icon, cat.color);
    });
  }

  console.log('✅ Database initialized successfully');
};

export default db;
