import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all accounts with calculated balances
router.get('/', (req, res) => {
  try {
    const accounts = db.prepare(`
      SELECT
        a.*,
        COALESCE(
          (SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
           FROM transactions t WHERE t.account_id = a.id), 0
        ) as calculated_balance
      FROM accounts a
      ORDER BY a.created_at ASC
    `).all();

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single account
router.get('/:id', (req, res) => {
  try {
    const account = db.prepare(`
      SELECT
        a.*,
        COALESCE(
          (SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
           FROM transactions t WHERE t.account_id = a.id), 0
        ) as calculated_balance
      FROM accounts a
      WHERE a.id = ?
    `).get(req.params.id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create account
router.post('/', (req, res) => {
  try {
    const { name, type, icon, color, initial_balance } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const validTypes = ['cash', 'bank', 'credit_card', 'savings', 'investment', 'other'];
    const accountType = validTypes.includes(type) ? type : 'cash';

    const result = db.prepare(`
      INSERT INTO accounts (name, type, icon, color, balance, currency)
      VALUES (?, ?, ?, ?, ?, 'COP')
    `).run(name, accountType, icon || '💰', color || '#6366F1', initial_balance || 0);

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update account
router.put('/:id', (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const existing = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    db.prepare(`
      UPDATE accounts
      SET name = ?, type = ?, icon = ?, color = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      type || existing.type,
      icon || existing.icon,
      color || existing.color,
      req.params.id
    );

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete('/:id', (req, res) => {
  try {
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if there are transactions linked to this account
    const transactions = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE account_id = ?').get(req.params.id);
    if (transactions.count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar una cuenta con transacciones. Primero elimina o mueve las transacciones.'
      });
    }

    db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get account transactions
router.get('/:id/transactions', (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const transactions = db.prepare(`
      SELECT t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.account_id = ?
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?
    `).all(req.params.id, parseInt(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer between accounts
router.post('/transfer', (req, res) => {
  try {
    const { from_account_id, to_account_id, amount, description, date } = req.body;

    if (!from_account_id || !to_account_id || !amount) {
      return res.status(400).json({ error: 'from_account_id, to_account_id, and amount are required' });
    }

    if (from_account_id === to_account_id) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    const transferDate = date || new Date().toISOString().split('T')[0];
    const transferDesc = description || 'Transferencia entre cuentas';

    // Create expense from source account
    db.prepare(`
      INSERT INTO transactions (type, amount, description, account_id, date)
      VALUES ('expense', ?, ?, ?, ?)
    `).run(amount, `${transferDesc} (salida)`, from_account_id, transferDate);

    // Create income to destination account
    db.prepare(`
      INSERT INTO transactions (type, amount, description, account_id, date)
      VALUES ('income', ?, ?, ?, ?)
    `).run(amount, `${transferDesc} (entrada)`, to_account_id, transferDate);

    res.json({ message: 'Transfer completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
