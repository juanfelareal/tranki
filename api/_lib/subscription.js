import { createClient } from '@supabase/supabase-js';

// Cliente con service_role para leer subscriptions (bypasses RLS for writes)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function getUserPlan(userId) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single();

  if (!data || data.status !== 'active') {
    return 'free';
  }

  return data.plan || 'free';
}

export async function getSubscription(userId) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data || { plan: 'free', status: 'active' };
}

export function requirePro(handler) {
  return async (req, res) => {
    const plan = await getUserPlan(req.user.id);
    if (plan !== 'pro') {
      return res.status(403).json({
        error: 'Esta función requiere el plan Pro',
        code: 'PRO_REQUIRED'
      });
    }
    return handler(req, res);
  };
}
