import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all budgets for a month/year
router.get('/', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;

    const budgets = db.prepare(`
      SELECT b.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(
          (SELECT SUM(amount) FROM transactions
           WHERE category_id = b.category_id
           AND type = 'expense'
           AND strftime('%m', date) = printf('%02d', ?)
           AND strftime('%Y', date) = ?), 0
        ) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.month = ? AND b.year = ?
      ORDER BY c.name
    `).all(month, year.toString(), month, year);

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall monthly budget
router.get('/monthly', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;

    const budget = db.prepare(`
      SELECT * FROM monthly_budgets
      WHERE month = ? AND year = ?
    `).get(month, year);

    // Calculate total spent
    const spent = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'expense'
      AND strftime('%m', date) = printf('%02d', ?)
      AND strftime('%Y', date) = ?
    `).get(month, year.toString());

    res.json({
      total_budget: budget?.total_budget || 0,
      spent: spent.total,
      remaining: (budget?.total_budget || 0) - spent.total,
      month: parseInt(month),
      year: parseInt(year)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set overall monthly budget
router.post('/monthly', (req, res) => {
  try {
    const now = new Date();
    const { total_budget, month = now.getMonth() + 1, year = now.getFullYear() } = req.body;

    if (total_budget === undefined) {
      return res.status(400).json({ error: 'total_budget is required' });
    }

    db.prepare(`
      INSERT INTO monthly_budgets (total_budget, month, year)
      VALUES (?, ?, ?)
      ON CONFLICT(month, year)
      DO UPDATE SET total_budget = ?, updated_at = CURRENT_TIMESTAMP
    `).run(total_budget, month, year, total_budget);

    const budget = db.prepare(`
      SELECT * FROM monthly_budgets WHERE month = ? AND year = ?
    `).get(month, year);

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set category budget
router.post('/', (req, res) => {
  try {
    const now = new Date();
    const { category_id, amount, month = now.getMonth() + 1, year = now.getFullYear() } = req.body;

    if (!category_id || amount === undefined) {
      return res.status(400).json({ error: 'category_id and amount are required' });
    }

    db.prepare(`
      INSERT INTO budgets (category_id, amount, month, year)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(category_id, month, year)
      DO UPDATE SET amount = ?, updated_at = CURRENT_TIMESTAMP
    `).run(category_id, amount, month, year, amount);

    const budget = db.prepare(`
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.category_id = ? AND b.month = ? AND b.year = ?
    `).get(category_id, month, year);

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update budget
router.put('/:id', (req, res) => {
  try {
    const { amount } = req.body;

    db.prepare(`
      UPDATE budgets SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(amount, req.params.id);

    const budget = db.prepare(`
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(req.params.id);

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete budget
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget vs actual comparison
router.get('/comparison', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;

    // Get all expense categories with their budgets and actual spending
    const comparison = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(b.amount, 0) as budget,
        COALESCE(
          (SELECT SUM(amount) FROM transactions
           WHERE category_id = c.id
           AND type = 'expense'
           AND strftime('%m', date) = printf('%02d', ?)
           AND strftime('%Y', date) = ?), 0
        ) as actual
      FROM categories c
      LEFT JOIN budgets b ON c.id = b.category_id AND b.month = ? AND b.year = ?
      WHERE c.type = 'expense'
      ORDER BY c.name
    `).all(month, year.toString(), month, year);

    // Add percentage and status
    const result = comparison.map(item => ({
      ...item,
      percentage: item.budget > 0 ? Math.round((item.actual / item.budget) * 100) : 0,
      status: item.budget === 0 ? 'no_budget' :
              item.actual > item.budget ? 'over' :
              item.actual > item.budget * 0.8 ? 'warning' : 'ok'
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
