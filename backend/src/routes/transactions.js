import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all transactions with filters
router.get('/', (req, res) => {
  try {
    const {
      type,
      category_id,
      start_date,
      end_date,
      search,
      limit = 100,
      offset = 0
    } = req.query;

    let query = `
      SELECT t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        a.name as account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }
    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (start_date) {
      query += ' AND t.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND t.date <= ?';
      params.push(end_date);
    }
    if (search) {
      query += ' AND t.description LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single transaction
router.get('/:id', (req, res) => {
  try {
    const transaction = db.prepare(`
      SELECT t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        a.name as account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      category_id,
      account_id = 1,
      date,
      receipt_url,
      voice_note_url,
      ai_extracted = 0
    } = req.body;

    if (!type || !amount || !date) {
      return res.status(400).json({ error: 'type, amount, and date are required' });
    }

    const result = db.prepare(`
      INSERT INTO transactions (type, amount, description, category_id, account_id, date, receipt_url, voice_note_url, ai_extracted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(type, amount, description || null, category_id || null, account_id, date, receipt_url || null, voice_note_url || null, ai_extracted);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
router.put('/:id', (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      category_id,
      account_id,
      date,
      receipt_url,
      voice_note_url
    } = req.body;

    db.prepare(`
      UPDATE transactions
      SET type = ?, amount = ?, description = ?, category_id = ?, account_id = ?,
          date = ?, receipt_url = ?, voice_note_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(type, amount, description || null, category_id || null, account_id || 1, date, receipt_url || null, voice_note_url || null, req.params.id);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk delete transactions
router.post('/bulk-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`DELETE FROM transactions WHERE id IN (${placeholders})`).run(...ids);
    res.json({ message: `${ids.length} transactions deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary stats
router.get('/stats/summary', (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = 'WHERE date >= ? AND date <= ?';
      params.push(start_date, end_date);
    }

    const income = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      ${dateFilter ? dateFilter + ' AND' : 'WHERE'} type = 'income'
    `).get(...params);

    const expenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      ${dateFilter ? dateFilter + ' AND' : 'WHERE'} type = 'expense'
    `).get(...params);

    const transactionCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions
      ${dateFilter}
    `).get(...params);

    res.json({
      income: income.total,
      expenses: expenses.total,
      balance: income.total - expenses.total,
      transaction_count: transactionCount.count,
      savings_rate: income.total > 0 ? ((income.total - expenses.total) / income.total * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
