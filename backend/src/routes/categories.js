import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  try {
    const { type } = req.query;

    let query = 'SELECT * FROM categories';
    const params = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY is_default DESC, name ASC';

    const categories = db.prepare(query).all(...params);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category stats (total and count for all categories)
router.get('/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        c.id as category_id,
        c.name,
        c.type,
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(t.id) as count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
      GROUP BY c.id
      ORDER BY total DESC
    `).all();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single category
router.get('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post('/', (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    const result = db.prepare(`
      INSERT INTO categories (name, type, icon, color, is_default)
      VALUES (?, ?, ?, ?, 0)
    `).run(name, type, icon || '📦', color || '#6366F1');

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.put('/:id', (req, res) => {
  try {
    const { name, icon, color } = req.body;

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare(`
      UPDATE categories
      SET name = ?, icon = ?, color = ?
      WHERE id = ?
    `).run(name || existing.name, icon || existing.icon, color || existing.color, req.params.id);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category (any category can be deleted)
router.delete('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has transactions
    const transactionCount = db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?'
    ).get(req.params.id);

    if (transactionCount.count > 0) {
      return res.status(400).json({
        error: `No se puede eliminar: tiene ${transactionCount.count} transacción(es) asociada(s)`
      });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CATEGORY RULES (Auto-categorization learning)
// ============================================

// Get all category rules
router.get('/rules', (req, res) => {
  try {
    const rules = db.prepare(`
      SELECT r.*, c.name as category_name, c.icon as category_icon, c.type as category_type
      FROM category_rules r
      JOIN categories c ON r.category_id = c.id
      ORDER BY r.keyword ASC
    `).all();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a category rule (learn association)
router.post('/rules', (req, res) => {
  try {
    const { keyword, category_id } = req.body;

    if (!keyword || !category_id) {
      return res.status(400).json({ error: 'keyword and category_id are required' });
    }

    // Normalize keyword (lowercase, trim)
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Check if rule already exists for this keyword
    const existing = db.prepare(
      'SELECT * FROM category_rules WHERE LOWER(keyword) = ?'
    ).get(normalizedKeyword);

    if (existing) {
      // Update existing rule
      db.prepare(
        'UPDATE category_rules SET category_id = ? WHERE id = ?'
      ).run(category_id, existing.id);

      const updated = db.prepare(`
        SELECT r.*, c.name as category_name, c.icon as category_icon
        FROM category_rules r
        JOIN categories c ON r.category_id = c.id
        WHERE r.id = ?
      `).get(existing.id);

      return res.json(updated);
    }

    // Create new rule
    const result = db.prepare(
      'INSERT INTO category_rules (keyword, category_id) VALUES (?, ?)'
    ).run(normalizedKeyword, category_id);

    const rule = db.prepare(`
      SELECT r.*, c.name as category_name, c.icon as category_icon
      FROM category_rules r
      JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category rule
router.delete('/rules/:id', (req, res) => {
  try {
    const rule = db.prepare('SELECT * FROM category_rules WHERE id = ?').get(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    db.prepare('DELETE FROM category_rules WHERE id = ?').run(req.params.id);
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Match text against rules to find category
router.post('/rules/match', (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text) {
      return res.json({ category_id: null, rule: null });
    }

    const normalizedText = text.toLowerCase().trim();

    // Get all rules with category info
    const rules = db.prepare(`
      SELECT r.*, c.name as category_name, c.icon as category_icon, c.type as category_type
      FROM category_rules r
      JOIN categories c ON r.category_id = c.id
      ${type ? 'WHERE c.type = ?' : ''}
      ORDER BY LENGTH(r.keyword) DESC
    `).all(type ? [type] : []);

    // Find best matching rule (longest keyword that matches)
    for (const rule of rules) {
      if (normalizedText.includes(rule.keyword)) {
        return res.json({
          category_id: rule.category_id,
          rule: rule
        });
      }
    }

    res.json({ category_id: null, rule: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk match multiple texts against rules
router.post('/rules/bulk-match', (req, res) => {
  try {
    const { items } = req.body; // Array of { text, type }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }

    // Get all rules
    const rules = db.prepare(`
      SELECT r.*, c.name as category_name, c.icon as category_icon, c.type as category_type
      FROM category_rules r
      JOIN categories c ON r.category_id = c.id
      ORDER BY LENGTH(r.keyword) DESC
    `).all();

    const results = items.map(item => {
      const normalizedText = (item.text || '').toLowerCase().trim();

      for (const rule of rules) {
        // Only match if types align (or no type filter)
        if (item.type && rule.category_type !== item.type) continue;

        if (normalizedText.includes(rule.keyword)) {
          return {
            text: item.text,
            category_id: rule.category_id,
            matched_rule: rule.keyword
          };
        }
      }

      return {
        text: item.text,
        category_id: null,
        matched_rule: null
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get spending by category
router.get('/stats/spending', (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = 'AND t.date >= ? AND t.date <= ?';
      params.push(start_date, end_date);
    }

    const spending = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(t.id) as transaction_count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.type = 'expense' ${dateFilter}
      WHERE c.type = 'expense'
      GROUP BY c.id
      ORDER BY total DESC
    `).all(...params);

    res.json(spending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
