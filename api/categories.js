import { withAuth } from './_lib/auth.js';

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/categories', '').split('/').filter(Boolean);
  const supabase = req.supabase;
  const userId = req.user.id;

  try {
    // === RULES ENDPOINTS ===
    if (pathParts[0] === 'rules') {
      // POST /api/categories/rules/match
      if (req.method === 'POST' && pathParts[1] === 'match') {
        const { text, type } = req.body;
        if (!text) return res.json({ category_id: null, rule: null });
        const normalizedText = text.toLowerCase().trim();
        const { data: rules } = await supabase.from('category_rules').select('*, categories(name, icon, type)');
        const sorted = (rules || []).filter(r => !type || r.categories?.type === type).sort((a, b) => b.keyword.length - a.keyword.length);
        for (const rule of sorted) {
          if (normalizedText.includes(rule.keyword)) {
            return res.json({ category_id: rule.category_id, rule: { ...rule, category_name: rule.categories?.name, category_icon: rule.categories?.icon, category_type: rule.categories?.type }});
          }
        }
        return res.json({ category_id: null, rule: null });
      }

      // POST /api/categories/rules/bulk-match
      if (req.method === 'POST' && pathParts[1] === 'bulk-match') {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'items array is required' });
        const { data: rules } = await supabase.from('category_rules').select('*, categories(name, icon, type)');
        const sorted = (rules || []).sort((a, b) => b.keyword.length - a.keyword.length);
        const results = items.map(item => {
          const normalizedText = (item.text || '').toLowerCase().trim();
          for (const rule of sorted) {
            if (item.type && rule.categories?.type !== item.type) continue;
            if (normalizedText.includes(rule.keyword)) return { text: item.text, category_id: rule.category_id, matched_rule: rule.keyword };
          }
          return { text: item.text, category_id: null, matched_rule: null };
        });
        return res.json(results);
      }

      // DELETE /api/categories/rules/:id
      if (req.method === 'DELETE' && pathParts[1]) {
        const { error } = await supabase.from('category_rules').delete().eq('id', pathParts[1]);
        if (error) throw error;
        return res.json({ message: 'Rule deleted successfully' });
      }

      // GET /api/categories/rules
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('category_rules').select('*, categories(name, icon, type)').order('keyword');
        if (error) throw error;
        return res.json(data.map(r => ({ ...r, category_name: r.categories?.name, category_icon: r.categories?.icon, category_type: r.categories?.type })));
      }

      // POST /api/categories/rules
      if (req.method === 'POST') {
        const { keyword, category_id } = req.body;
        if (!keyword || !category_id) return res.status(400).json({ error: 'keyword and category_id are required' });
        const normalized = keyword.toLowerCase().trim();
        const { data: existing } = await supabase.from('category_rules').select('id').ilike('keyword', normalized).single();
        if (existing) {
          const { data } = await supabase.from('category_rules').update({ category_id }).eq('id', existing.id).select('*, categories(name, icon)').single();
          return res.json({ ...data, category_name: data.categories?.name, category_icon: data.categories?.icon });
        }
        const { data, error } = await supabase.from('category_rules').insert({ user_id: userId, keyword: normalized, category_id }).select('*, categories(name, icon)').single();
        if (error) throw error;
        return res.status(201).json({ ...data, category_name: data.categories?.name, category_icon: data.categories?.icon });
      }
    }

    // === STATS ENDPOINTS ===
    if (pathParts[0] === 'stats') {
      // GET /api/categories/stats/spending
      if (pathParts[1] === 'spending') {
        const { start_date, end_date } = req.query;
        const { data: categories } = await supabase.from('categories').select('id, name, icon, color').eq('type', 'expense');
        let txQuery = supabase.from('transactions').select('category_id, amount').eq('type', 'expense');
        if (start_date && end_date) txQuery = txQuery.gte('date', start_date).lte('date', end_date);
        const { data: transactions } = await txQuery;
        const spending = (categories || []).map(cat => {
          const catTx = (transactions || []).filter(t => t.category_id === cat.id);
          return { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, total: catTx.reduce((sum, t) => sum + t.amount, 0), transaction_count: catTx.length };
        }).sort((a, b) => b.total - a.total);
        return res.json(spending);
      }

      // GET /api/categories/stats
      const { data: categories } = await supabase.from('categories').select('id, name, type');
      const { data: transactions } = await supabase.from('transactions').select('category_id, amount');
      const stats = (categories || []).map(cat => {
        const catTx = (transactions || []).filter(t => t.category_id === cat.id);
        return { category_id: cat.id, name: cat.name, type: cat.type, total: catTx.reduce((sum, t) => sum + t.amount, 0), count: catTx.length };
      }).sort((a, b) => b.total - a.total);
      return res.json(stats);
    }

    // === CRUD BY ID ===
    if (pathParts[0] && !isNaN(pathParts[0])) {
      const id = pathParts[0];
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Category not found' });
        return res.json(data);
      }
      if (req.method === 'PUT') {
        const { name, icon, color } = req.body;
        const { data: existing } = await supabase.from('categories').select('*').eq('id', id).single();
        if (!existing) return res.status(404).json({ error: 'Category not found' });
        // Solo permitir editar categorías propias
        if (existing.user_id && existing.user_id !== userId) {
          return res.status(403).json({ error: 'No puedes editar esta categoría' });
        }
        const { data, error } = await supabase.from('categories').update({ name: name || existing.name, icon: icon || existing.icon, color: color || existing.color }).eq('id', id).select().single();
        if (error) throw error;
        return res.json(data);
      }
      if (req.method === 'DELETE') {
        const { data: existing } = await supabase.from('categories').select('user_id').eq('id', id).single();
        if (existing?.user_id !== userId) {
          return res.status(403).json({ error: 'No puedes eliminar esta categoría' });
        }
        const { count } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('category_id', id);
        if (count > 0) return res.status(400).json({ error: `No se puede eliminar: tiene ${count} transacción(es) asociada(s)` });
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Category deleted successfully' });
      }
    }

    // === LIST / CREATE ===
    if (req.method === 'GET') {
      const { type } = req.query;
      // Las categorías por defecto (user_id IS NULL) + las del usuario
      let query = supabase.from('categories').select('*').order('is_default', { ascending: false }).order('name');
      if (type) query = query.eq('type', type);
      const { data, error } = await query;
      if (error) throw error;
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { name, type, icon, color } = req.body;
      if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
      if (!['income', 'expense'].includes(type)) return res.status(400).json({ error: 'type must be income or expense' });
      const { data, error } = await supabase.from('categories').insert({ user_id: userId, name, type, icon: icon || '📦', color: color || '#6366F1', is_default: false }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Categories error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
