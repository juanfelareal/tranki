import { withAuth } from './_lib/auth.js';

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/transactions', '').split('/').filter(Boolean);
  const supabase = req.supabase;
  const userId = req.user.id;

  try {
    // POST /api/transactions/bulk-delete
    if (req.method === 'POST' && pathParts[0] === 'bulk-delete') {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids array is required' });
      }
      const { error } = await supabase.from('transactions').delete().in('id', ids);
      if (error) throw error;
      return res.json({ message: `${ids.length} transactions deleted successfully` });
    }

    // GET /api/transactions/stats/summary
    if (req.method === 'GET' && pathParts[0] === 'stats' && pathParts[1] === 'summary') {
      const { start_date, end_date } = req.query;
      let incomeQuery = supabase.from('transactions').select('amount').eq('type', 'income');
      let expenseQuery = supabase.from('transactions').select('amount').eq('type', 'expense');
      let countQuery = supabase.from('transactions').select('id', { count: 'exact' });

      if (start_date && end_date) {
        incomeQuery = incomeQuery.gte('date', start_date).lte('date', end_date);
        expenseQuery = expenseQuery.gte('date', start_date).lte('date', end_date);
        countQuery = countQuery.gte('date', start_date).lte('date', end_date);
      }

      const [incomeResult, expenseResult, countResult] = await Promise.all([incomeQuery, expenseQuery, countQuery]);
      const income = incomeResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const expenses = expenseResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return res.json({
        income, expenses, balance: income - expenses,
        transaction_count: countResult.count || 0,
        savings_rate: income > 0 ? parseFloat(((income - expenses) / income * 100).toFixed(1)) : 0
      });
    }

    // GET/PUT/DELETE /api/transactions/:id
    if (pathParts[0] && !isNaN(pathParts[0])) {
      const id = pathParts[0];

      if (req.method === 'GET') {
        const { data, error } = await supabase.from('transactions')
          .select('*, categories(name, icon, color), accounts(name)')
          .eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Transaction not found' });
        return res.json({
          ...data,
          category_name: data.categories?.name, category_icon: data.categories?.icon,
          category_color: data.categories?.color, account_name: data.accounts?.name
        });
      }

      if (req.method === 'PUT') {
        const { type, amount, description, category_id, account_id, date, receipt_url, voice_note_url } = req.body;
        const { data, error } = await supabase.from('transactions')
          .update({ type, amount, description, category_id, account_id: account_id || 1, date, receipt_url, voice_note_url, updated_at: new Date().toISOString() })
          .eq('id', id).select().single();
        if (error) throw error;
        return res.json(data);
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Transaction deleted successfully' });
      }
    }

    // GET /api/transactions - List all
    if (req.method === 'GET') {
      const { type, category_id, start_date, end_date, search, limit = 100, offset = 0 } = req.query;
      let query = supabase.from('transactions')
        .select('*, categories(name, icon, color), accounts(name)')
        .order('date', { ascending: false }).order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (type) query = query.eq('type', type);
      if (category_id) query = query.eq('category_id', category_id);
      if (start_date) query = query.gte('date', start_date);
      if (end_date) query = query.lte('date', end_date);
      if (search) query = query.ilike('description', `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data.map(t => ({
        ...t, category_name: t.categories?.name, category_icon: t.categories?.icon,
        category_color: t.categories?.color, account_name: t.accounts?.name
      })));
    }

    // POST /api/transactions - Create
    if (req.method === 'POST') {
      const { type, amount, description, category_id, account_id, date, receipt_url, voice_note_url, ai_extracted = false } = req.body;
      if (!type || !amount || !date) return res.status(400).json({ error: 'type, amount, and date are required' });

      // Obtener la primera cuenta del usuario si no se especifica
      let finalAccountId = account_id;
      if (!finalAccountId) {
        const { data: accounts } = await supabase.from('accounts').select('id').limit(1);
        finalAccountId = accounts?.[0]?.id;
      }

      const { data, error } = await supabase.from('transactions')
        .insert({ user_id: userId, type, amount, description, category_id, account_id: finalAccountId, date, receipt_url, voice_note_url, ai_extracted })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Transactions error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
