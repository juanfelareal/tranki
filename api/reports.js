import { withAuth } from './_lib/auth.js';
import { getUserPlan } from './_lib/subscription.js';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/reports', '').split('/').filter(Boolean);
  const now = new Date();
  const supabase = req.supabase;

  try {
    // Bloquear reportes para plan free
    const plan = await getUserPlan(req.user.id);
    if (plan !== 'pro') {
      return res.status(403).json({
        error: 'Los reportes requieren el plan Pro',
        code: 'PRO_REQUIRED'
      });
    }

    // GET /api/reports/summary
    if (pathParts[0] === 'summary') {
      const { start_date, end_date } = req.query;
      let incomeQuery = supabase.from('transactions').select('amount').eq('type', 'income');
      let expenseQuery = supabase.from('transactions').select('amount').eq('type', 'expense');
      if (start_date && end_date) {
        incomeQuery = incomeQuery.gte('date', start_date).lte('date', end_date);
        expenseQuery = expenseQuery.gte('date', start_date).lte('date', end_date);
      }
      const [incomeResult, expenseResult] = await Promise.all([incomeQuery, expenseQuery]);
      const income = incomeResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const expenses = expenseResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      return res.json({ income, expenses, balance: income - expenses, savings_rate: income > 0 ? parseFloat(((income - expenses) / income * 100).toFixed(1)) : 0 });
    }

    // GET /api/reports/by-category
    if (pathParts[0] === 'by-category') {
      const { start_date, end_date, type = 'expense' } = req.query;
      const { data: categories } = await supabase.from('categories').select('id, name, icon, color').eq('type', type);
      let txQuery = supabase.from('transactions').select('category_id, amount').eq('type', type);
      if (start_date && end_date) txQuery = txQuery.gte('date', start_date).lte('date', end_date);
      const { data: transactions } = await txQuery;
      const result = (categories || []).map(cat => {
        const catTx = (transactions || []).filter(t => t.category_id === cat.id);
        return { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, total: catTx.reduce((sum, t) => sum + t.amount, 0), count: catTx.length };
      }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
      const grandTotal = result.reduce((sum, c) => sum + c.total, 0);
      return res.json(result.map(c => ({ ...c, percentage: grandTotal > 0 ? parseFloat(((c.total / grandTotal) * 100).toFixed(1)) : 0 })));
    }

    // GET /api/reports/recent
    if (pathParts[0] === 'recent') {
      const { limit = 10 } = req.query;
      const { data, error } = await supabase.from('transactions')
        .select('*, categories(name, icon, color), accounts(name)')
        .order('date', { ascending: false }).order('created_at', { ascending: false })
        .limit(parseInt(limit));
      if (error) throw error;
      return res.json(data.map(t => ({ ...t, category_name: t.categories?.name, category_icon: t.categories?.icon, category_color: t.categories?.color, account_name: t.accounts?.name })));
    }

    // GET /api/reports/top-expenses
    if (pathParts[0] === 'top-expenses') {
      const { limit = 5, start_date, end_date } = req.query;
      let query = supabase.from('transactions').select('*, categories(name, icon, color)').eq('type', 'expense').order('amount', { ascending: false }).limit(parseInt(limit));
      if (start_date && end_date) query = query.gte('date', start_date).lte('date', end_date);
      const { data, error } = await query;
      if (error) throw error;
      return res.json(data.map(t => ({ ...t, category_name: t.categories?.name, category_icon: t.categories?.icon, category_color: t.categories?.color })));
    }

    // GET /api/reports/trends/daily
    if (pathParts[0] === 'trends' && pathParts[1] === 'daily') {
      const { start_date, end_date } = req.query;
      if (!start_date || !end_date) return res.status(400).json({ error: 'start_date and end_date are required' });
      const { data: transactions } = await supabase.from('transactions').select('date, type, amount').gte('date', start_date).lte('date', end_date).order('date');
      const grouped = {};
      for (const tx of transactions || []) {
        if (!grouped[tx.date]) grouped[tx.date] = { date: tx.date, income: 0, expenses: 0 };
        if (tx.type === 'income') grouped[tx.date].income += tx.amount;
        else grouped[tx.date].expenses += tx.amount;
      }
      return res.json(Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)));
    }

    // GET /api/reports/trends/monthly
    if (pathParts[0] === 'trends' && pathParts[1] === 'monthly') {
      const { months = 6 } = req.query;
      const result = [];
      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear(), month = d.getMonth() + 1;
        const monthStr = month.toString().padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`, endDate = `${year}-${monthStr}-31`;
        const { data: transactions } = await supabase.from('transactions').select('type, amount').gte('date', startDate).lte('date', endDate);
        const income = (transactions || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = (transactions || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        result.push({ year, month: `${year}-${monthStr}`, month_name: d.toLocaleString('es-CO', { month: 'short' }), income, expense, balance: income - expense });
      }
      return res.json(result);
    }

    return res.status(404).json({ error: 'Report endpoint not found' });
  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
