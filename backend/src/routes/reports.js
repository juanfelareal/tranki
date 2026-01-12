import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get monthly summary
router.get('/summary', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;

    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    // Income
    const income = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'income'
      AND strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
    `).get(monthStr, yearStr);

    // Expenses
    const expenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'expense'
      AND strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
    `).get(monthStr, yearStr);

    // Transaction count
    const count = db.prepare(`
      SELECT COUNT(*) as total
      FROM transactions
      WHERE strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
    `).get(monthStr, yearStr);

    // Previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthStr = prevMonth.toString().padStart(2, '0');
    const prevYearStr = prevYear.toString();

    const prevExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'expense'
      AND strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
    `).get(prevMonthStr, prevYearStr);

    const balance = income.total - expenses.total;
    const savingsRate = income.total > 0 ? ((balance / income.total) * 100).toFixed(1) : 0;
    const expenseChange = prevExpenses.total > 0
      ? (((expenses.total - prevExpenses.total) / prevExpenses.total) * 100).toFixed(1)
      : 0;

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      income: income.total,
      expenses: expenses.total,
      balance,
      savings_rate: parseFloat(savingsRate),
      transaction_count: count.total,
      expense_change: parseFloat(expenseChange)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get spending by category
router.get('/by-category', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear(), type = 'expense' } = req.query;

    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    const data = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(t.id) as count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
        AND strftime('%m', t.date) = ?
        AND strftime('%Y', t.date) = ?
      WHERE c.type = ?
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC
    `).all(monthStr, yearStr, type);

    // Calculate percentages
    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
    const result = data.map(item => ({
      ...item,
      percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily spending trend
router.get('/trends/daily', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;

    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    const data = db.prepare(`
      SELECT
        date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
      GROUP BY date
      ORDER BY date
    `).all(monthStr, yearStr);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly trend (last 6 months)
router.get('/trends/monthly', (req, res) => {
  try {
    const { months = 6 } = req.query;

    const data = db.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE date >= date('now', '-' || ? || ' months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month
    `).all(months);

    // Calculate balance for each month
    const result = data.map(item => ({
      ...item,
      balance: item.income - item.expense
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top expenses
router.get('/top-expenses', (req, res) => {
  try {
    const now = new Date();
    const { month = now.getMonth() + 1, year = now.getFullYear(), limit = 10 } = req.query;

    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    const data = db.prepare(`
      SELECT t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
      AND strftime('%m', t.date) = ?
      AND strftime('%Y', t.date) = ?
      ORDER BY t.amount DESC
      LIMIT ?
    `).all(monthStr, yearStr, parseInt(limit));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent transactions
router.get('/recent', (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const data = db.prepare(`
      SELECT t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?
    `).all(parseInt(limit));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
