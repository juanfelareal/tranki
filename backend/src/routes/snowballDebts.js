import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all debts ordered by current balance (snowball method)
router.get('/', (req, res) => {
  try {
    const debts = db.prepare(`
      SELECT d.*,
        COALESCE(
          (SELECT SUM(amount) FROM debt_payments WHERE debt_id = d.id), 0
        ) as total_paid
      FROM snowball_debts d
      ORDER BY
        CASE WHEN d.status = 'paid_off' THEN 1 ELSE 0 END,
        d.current_balance ASC
    `).all();

    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary (totals and estimated payoff date)
router.get('/summary', (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT
        COALESCE(SUM(original_amount), 0) as total_original,
        COALESCE(SUM(current_balance), 0) as total_current,
        COALESCE(SUM(original_amount - current_balance), 0) as total_paid,
        COUNT(*) as total_debts,
        SUM(CASE WHEN status = 'paid_off' THEN 1 ELSE 0 END) as debts_paid_off,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as debts_active,
        COALESCE(SUM(minimum_payment), 0) as total_minimum_payments
      FROM snowball_debts
    `).get();

    // Calculate estimated months to payoff (simplified)
    let estimatedMonths = 0;
    if (summary.total_minimum_payments > 0 && summary.total_current > 0) {
      // Simple estimate without interest
      estimatedMonths = Math.ceil(summary.total_current / summary.total_minimum_payments);
    }

    const estimatedPayoffDate = estimatedMonths > 0
      ? new Date(Date.now() + estimatedMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    res.json({
      ...summary,
      estimated_months: estimatedMonths,
      estimated_payoff_date: estimatedPayoffDate,
      progress_percentage: summary.total_original > 0
        ? Math.round((summary.total_paid / summary.total_original) * 100)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single debt with payment history
router.get('/:id', (req, res) => {
  try {
    const debt = db.prepare(`
      SELECT d.*,
        COALESCE(
          (SELECT SUM(amount) FROM debt_payments WHERE debt_id = d.id), 0
        ) as total_paid
      FROM snowball_debts d
      WHERE d.id = ?
    `).get(req.params.id);

    if (!debt) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    const payments = db.prepare(`
      SELECT * FROM debt_payments
      WHERE debt_id = ?
      ORDER BY date DESC, created_at DESC
    `).all(req.params.id);

    res.json({ ...debt, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new debt
router.post('/', (req, res) => {
  try {
    const {
      name,
      creditor,
      original_amount,
      current_balance,
      interest_rate = 0,
      minimum_payment = 0,
      due_day
    } = req.body;

    if (!name || !original_amount) {
      return res.status(400).json({ error: 'Nombre y monto original son requeridos' });
    }

    const result = db.prepare(`
      INSERT INTO snowball_debts (name, creditor, original_amount, current_balance, interest_rate, minimum_payment, due_day)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      creditor || null,
      original_amount,
      current_balance ?? original_amount,
      interest_rate,
      minimum_payment,
      due_day || null
    );

    const debt = db.prepare('SELECT * FROM snowball_debts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update debt
router.put('/:id', (req, res) => {
  try {
    const {
      name,
      creditor,
      original_amount,
      current_balance,
      interest_rate,
      minimum_payment,
      due_day,
      status
    } = req.body;

    const existing = db.prepare('SELECT * FROM snowball_debts WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    db.prepare(`
      UPDATE snowball_debts
      SET name = ?, creditor = ?, original_amount = ?, current_balance = ?,
          interest_rate = ?, minimum_payment = ?, due_day = ?, status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name ?? existing.name,
      creditor ?? existing.creditor,
      original_amount ?? existing.original_amount,
      current_balance ?? existing.current_balance,
      interest_rate ?? existing.interest_rate,
      minimum_payment ?? existing.minimum_payment,
      due_day ?? existing.due_day,
      status ?? existing.status,
      req.params.id
    );

    const debt = db.prepare('SELECT * FROM snowball_debts WHERE id = ?').get(req.params.id);
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete debt
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM snowball_debts WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    db.prepare('DELETE FROM snowball_debts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Deuda eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record payment
router.post('/:id/pay', (req, res) => {
  try {
    const { amount, date, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto de pago es requerido' });
    }

    const debt = db.prepare('SELECT * FROM snowball_debts WHERE id = ?').get(req.params.id);
    if (!debt) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    // Insert payment
    const paymentDate = date || new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO debt_payments (debt_id, amount, date, note)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, amount, paymentDate, note || null);

    // Update current balance
    const newBalance = Math.max(0, debt.current_balance - amount);
    const newStatus = newBalance === 0 ? 'paid_off' : 'active';

    db.prepare(`
      UPDATE snowball_debts
      SET current_balance = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newBalance, newStatus, req.params.id);

    // Return updated debt
    const updatedDebt = db.prepare(`
      SELECT d.*,
        COALESCE(
          (SELECT SUM(amount) FROM debt_payments WHERE debt_id = d.id), 0
        ) as total_paid
      FROM snowball_debts d
      WHERE d.id = ?
    `).get(req.params.id);

    res.json(updatedDebt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history for a debt
router.get('/:id/payments', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT * FROM debt_payments
      WHERE debt_id = ?
      ORDER BY date DESC, created_at DESC
    `).all(req.params.id);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
