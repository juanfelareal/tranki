import { withAuth } from './_lib/auth.js';

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/budgets', '').split('/').filter(Boolean);
  const now = new Date();
  const supabase = req.supabase;
  const userId = req.user.id;

  try {
    // GET/POST /api/budgets/monthly
    if (pathParts[0] === 'monthly') {
      if (req.method === 'GET') {
        const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;
        const monthStr = month.toString().padStart(2, '0');
        const { data: budget } = await supabase.from('monthly_budgets').select('*').eq('month', month).eq('year', year).single();
        const startDate = `${year}-${monthStr}-01`, endDate = `${year}-${monthStr}-31`;
        const { data: transactions } = await supabase.from('transactions').select('amount').eq('type', 'expense').gte('date', startDate).lte('date', endDate);
        const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
        return res.json({ total_budget: budget?.total_budget || 0, spent, remaining: (budget?.total_budget || 0) - spent, month: parseInt(month), year: parseInt(year) });
      }
      if (req.method === 'POST') {
        const { total_budget, month = now.getMonth() + 1, year = now.getFullYear() } = req.body;
        if (total_budget === undefined) return res.status(400).json({ error: 'total_budget is required' });
        const { data: existing } = await supabase.from('monthly_budgets').select('id').eq('month', month).eq('year', year).single();
        let data;
        if (existing) {
          const { data: updated } = await supabase.from('monthly_budgets').update({ total_budget, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single();
          data = updated;
        } else {
          const { data: created } = await supabase.from('monthly_budgets').insert({ user_id: userId, total_budget, month, year }).select().single();
          data = created;
        }
        return res.json(data);
      }
    }

    // GET /api/budgets/comparison
    if (pathParts[0] === 'comparison' && req.method === 'GET') {
      const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;
      const monthStr = month.toString().padStart(2, '0');
      const { data: categories } = await supabase.from('categories').select('id, name, icon, color').eq('type', 'expense').order('name');
      const { data: budgets } = await supabase.from('budgets').select('category_id, amount').eq('month', month).eq('year', year);
      const startDate = `${year}-${monthStr}-01`, endDate = `${year}-${monthStr}-31`;
      const { data: transactions } = await supabase.from('transactions').select('category_id, amount').eq('type', 'expense').gte('date', startDate).lte('date', endDate);
      const result = (categories || []).map(cat => {
        const budget = budgets?.find(b => b.category_id === cat.id)?.amount || 0;
        const actual = (transactions || []).filter(t => t.category_id === cat.id).reduce((sum, t) => sum + t.amount, 0);
        const percentage = budget > 0 ? Math.round((actual / budget) * 100) : 0;
        const status = budget === 0 ? 'no_budget' : actual > budget ? 'over' : actual > budget * 0.8 ? 'warning' : 'ok';
        return { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, budget, actual, percentage, status };
      });
      return res.json(result);
    }

    // PUT/DELETE /api/budgets/:id
    if (pathParts[0] && !isNaN(pathParts[0])) {
      const id = pathParts[0];
      if (req.method === 'PUT') {
        const { amount } = req.body;
        const { data, error } = await supabase.from('budgets').update({ amount, updated_at: new Date().toISOString() }).eq('id', id).select('*, categories(name, icon, color)').single();
        if (error) throw error;
        return res.json({ ...data, category_name: data.categories?.name, category_icon: data.categories?.icon, category_color: data.categories?.color });
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Budget deleted successfully' });
      }
    }

    // GET /api/budgets
    if (req.method === 'GET') {
      const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query;
      const monthStr = month.toString().padStart(2, '0');
      const { data: budgets } = await supabase.from('budgets').select('*, categories(name, icon, color)').eq('month', month).eq('year', year);
      const startDate = `${year}-${monthStr}-01`, endDate = `${year}-${monthStr}-31`;
      const { data: transactions } = await supabase.from('transactions').select('category_id, amount').eq('type', 'expense').gte('date', startDate).lte('date', endDate);
      const result = (budgets || []).map(b => {
        const spent = (transactions || []).filter(t => t.category_id === b.category_id).reduce((sum, t) => sum + t.amount, 0);
        return { ...b, category_name: b.categories?.name, category_icon: b.categories?.icon, category_color: b.categories?.color, spent };
      });
      return res.json(result);
    }

    // POST /api/budgets
    if (req.method === 'POST') {
      const { category_id, amount, month = now.getMonth() + 1, year = now.getFullYear() } = req.body;
      if (!category_id || amount === undefined) return res.status(400).json({ error: 'category_id and amount are required' });
      const { data: existing } = await supabase.from('budgets').select('id').eq('category_id', category_id).eq('month', month).eq('year', year).single();
      let data;
      if (existing) {
        const { data: updated } = await supabase.from('budgets').update({ amount, updated_at: new Date().toISOString() }).eq('id', existing.id).select('*, categories(name, icon, color)').single();
        data = updated;
      } else {
        const { data: created } = await supabase.from('budgets').insert({ user_id: userId, category_id, amount, month, year }).select('*, categories(name, icon, color)').single();
        data = created;
      }
      return res.json({ ...data, category_name: data.categories?.name, category_icon: data.categories?.icon, category_color: data.categories?.color });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budgets error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
