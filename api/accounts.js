import { withAuth } from './_lib/auth.js';
import { getUserPlan } from './_lib/subscription.js';

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/accounts', '').split('/').filter(Boolean);
  const supabase = req.supabase;
  const userId = req.user.id;

  try {
    // POST /api/accounts/transfer
    if (req.method === 'POST' && pathParts[0] === 'transfer') {
      const { from_account_id, to_account_id, amount, description, date } = req.body;
      if (!from_account_id || !to_account_id || !amount) return res.status(400).json({ error: 'from_account_id, to_account_id, and amount are required' });
      if (from_account_id === to_account_id) return res.status(400).json({ error: 'Cannot transfer to the same account' });
      const transferDate = date || new Date().toISOString().split('T')[0];
      const transferDesc = description || 'Transferencia entre cuentas';
      await supabase.from('transactions').insert({ user_id: userId, type: 'expense', amount, description: `${transferDesc} (salida)`, account_id: from_account_id, date: transferDate });
      await supabase.from('transactions').insert({ user_id: userId, type: 'income', amount, description: `${transferDesc} (entrada)`, account_id: to_account_id, date: transferDate });
      return res.json({ message: 'Transfer completed successfully' });
    }

    // /api/accounts/:id/transactions
    if (pathParts[0] && pathParts[1] === 'transactions') {
      const { limit = 20 } = req.query;
      const { data, error } = await supabase.from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('account_id', pathParts[0])
        .order('date', { ascending: false }).order('created_at', { ascending: false })
        .limit(parseInt(limit));
      if (error) throw error;
      return res.json(data.map(t => ({ ...t, category_name: t.categories?.name, category_icon: t.categories?.icon, category_color: t.categories?.color })));
    }

    // /api/accounts/:id
    if (pathParts[0] && !isNaN(pathParts[0])) {
      const id = pathParts[0];

      if (req.method === 'GET') {
        const { data: account, error } = await supabase.from('accounts').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Account not found' });
        const { data: transactions } = await supabase.from('transactions').select('type, amount').eq('account_id', id);
        const calculated_balance = (transactions || []).reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        return res.json({ ...account, calculated_balance });
      }

      if (req.method === 'PUT') {
        const { name, type, icon, color } = req.body;
        const { data: existing } = await supabase.from('accounts').select('*').eq('id', id).single();
        if (!existing) return res.status(404).json({ error: 'Account not found' });
        const { data, error } = await supabase.from('accounts')
          .update({ name: name || existing.name, type: type || existing.type, icon: icon || existing.icon, color: color || existing.color })
          .eq('id', id).select().single();
        if (error) throw error;
        return res.json(data);
      }

      if (req.method === 'DELETE') {
        const { count } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('account_id', id);
        if (count > 0) return res.status(400).json({ error: 'No se puede eliminar una cuenta con transacciones.' });
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Account deleted successfully' });
      }
    }

    // GET /api/accounts
    if (req.method === 'GET') {
      const { data: accounts, error } = await supabase.from('accounts').select('*').order('created_at');
      if (error) throw error;
      const { data: transactions } = await supabase.from('transactions').select('account_id, type, amount');
      const result = (accounts || []).map(acc => {
        const accTx = (transactions || []).filter(t => t.account_id === acc.id);
        const calculated_balance = accTx.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        return { ...acc, calculated_balance };
      });
      return res.json(result);
    }

    // POST /api/accounts
    if (req.method === 'POST') {
      const { name, type, icon, color, initial_balance } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required' });

      // Limitar a 1 cuenta para plan free
      const plan = await getUserPlan(userId);
      if (plan !== 'pro') {
        const { count } = await supabase
          .from('accounts')
          .select('id', { count: 'exact', head: true });
        if (count >= 1) {
          return res.status(403).json({
            error: 'El plan gratuito permite solo 1 cuenta. Actualiza a Pro para crear más.',
            code: 'PRO_REQUIRED'
          });
        }
      }
      const validTypes = ['cash', 'bank', 'credit_card', 'savings', 'investment', 'other'];
      const accountType = validTypes.includes(type) ? type : 'cash';
      const { data, error } = await supabase.from('accounts').insert({ user_id: userId, name, type: accountType, icon: icon || '💰', color: color || '#6366F1', balance: initial_balance || 0, currency: 'COP' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Accounts error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
