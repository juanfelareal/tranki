import { withAuth } from './_lib/auth.js';

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/snowball-debts', '').split('/').filter(Boolean);
  const supabase = req.supabase;
  const userId = req.user.id;

  try {
    // GET /api/snowball-debts/summary
    if (pathParts[0] === 'summary' && req.method === 'GET') {
      const { data: debts } = await supabase.from('snowball_debts').select('*').eq('status', 'active').order('current_balance');
      const { data: payments } = await supabase.from('debt_payments').select('debt_id, amount');
      const totalDebt = (debts || []).reduce((sum, d) => sum + d.current_balance, 0);
      const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
      const totalOriginal = (debts || []).reduce((sum, d) => sum + d.original_amount, 0);
      const debtCount = (debts || []).length;
      const smallestDebt = debtCount > 0 ? debts[0] : null;
      return res.json({ total_debt: totalDebt, total_paid: totalPaid, total_original: totalOriginal, debt_count: debtCount, smallest_debt: smallestDebt, progress_percentage: totalOriginal > 0 ? parseFloat(((totalPaid / totalOriginal) * 100).toFixed(1)) : 0 });
    }

    // /api/snowball-debts/:id/payments
    if (pathParts[0] && pathParts[1] === 'payments') {
      const debtId = pathParts[0];
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('debt_payments').select('*').eq('debt_id', debtId).order('date', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
    }

    // POST /api/snowball-debts/:id/pay
    if (pathParts[0] && pathParts[1] === 'pay' && req.method === 'POST') {
      const debtId = pathParts[0];
      const { amount, date, note } = req.body;
      if (!amount) return res.status(400).json({ error: 'amount is required' });
      const { data: debt } = await supabase.from('snowball_debts').select('*').eq('id', debtId).single();
      if (!debt) return res.status(404).json({ error: 'Debt not found' });
      const newBalance = Math.max(0, debt.current_balance - amount);
      const newStatus = newBalance === 0 ? 'paid_off' : 'active';
      await supabase.from('debt_payments').insert({ user_id: userId, debt_id: debtId, amount, date: date || new Date().toISOString().split('T')[0], note });
      const { data: updated } = await supabase.from('snowball_debts').update({ current_balance: newBalance, status: newStatus, updated_at: new Date().toISOString() }).eq('id', debtId).select().single();
      return res.json({ debt: updated, payment_applied: amount, new_balance: newBalance, status: newStatus });
    }

    // GET/PUT/DELETE /api/snowball-debts/:id
    if (pathParts[0] && !isNaN(pathParts[0]) && !pathParts[1]) {
      const id = pathParts[0];

      if (req.method === 'GET') {
        const { data: debt, error } = await supabase.from('snowball_debts').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Debt not found' });
        const { data: payments } = await supabase.from('debt_payments').select('*').eq('debt_id', id).order('date', { ascending: false });
        const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
        return res.json({ ...debt, total_paid: totalPaid, payments: payments || [] });
      }

      if (req.method === 'PUT') {
        const { name, creditor, current_balance, interest_rate, minimum_payment, due_day, status } = req.body;
        const { data: existing } = await supabase.from('snowball_debts').select('*').eq('id', id).single();
        if (!existing) return res.status(404).json({ error: 'Debt not found' });
        const { data, error } = await supabase.from('snowball_debts').update({
          name: name ?? existing.name,
          creditor: creditor ?? existing.creditor,
          current_balance: current_balance ?? existing.current_balance,
          interest_rate: interest_rate ?? existing.interest_rate,
          minimum_payment: minimum_payment ?? existing.minimum_payment,
          due_day: due_day ?? existing.due_day,
          status: status ?? existing.status,
          updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        return res.json(data);
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase.from('snowball_debts').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Debt deleted successfully' });
      }
    }

    // GET /api/snowball-debts
    if (req.method === 'GET') {
      const { status = 'active' } = req.query;
      let query = supabase.from('snowball_debts').select('*').order('current_balance');
      if (status !== 'all') query = query.eq('status', status);
      const { data: debts, error } = await query;
      if (error) throw error;
      const { data: payments } = await supabase.from('debt_payments').select('debt_id, amount');
      const result = (debts || []).map(debt => {
        const debtPayments = (payments || []).filter(p => p.debt_id === debt.id);
        const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
        return { ...debt, total_paid: totalPaid, progress_percentage: debt.original_amount > 0 ? parseFloat(((totalPaid / debt.original_amount) * 100).toFixed(1)) : 0 };
      });
      return res.json(result);
    }

    // POST /api/snowball-debts
    if (req.method === 'POST') {
      const { name, creditor, original_amount, current_balance, interest_rate, minimum_payment, due_day } = req.body;
      if (!name || !original_amount) return res.status(400).json({ error: 'name and original_amount are required' });
      const { data, error } = await supabase.from('snowball_debts').insert({
        user_id: userId, name, creditor, original_amount, current_balance: current_balance ?? original_amount,
        interest_rate: interest_rate || 0, minimum_payment: minimum_payment || 0, due_day, status: 'active'
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Snowball debts error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
