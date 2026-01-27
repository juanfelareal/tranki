import { withAuth } from '../_lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;

    // Verificar si el usuario ya tiene una cuenta
    const { data: existingAccount } = await req.supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (existingAccount) {
      // Asegurar que tenga suscripción
      const { data: existingSub } = await req.supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingSub) {
        await req.supabase
          .from('subscriptions')
          .insert({ user_id: userId, plan: 'free', status: 'active' });
      }

      return res.json({ message: 'User already set up', account_id: existingAccount.id });
    }

    // Crear cuenta "Efectivo" por defecto para el nuevo usuario
    const { data: account, error: accountError } = await req.supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name: 'Efectivo',
        type: 'cash',
        balance: 0,
        currency: 'COP',
        icon: '💵',
        color: '#6366F1'
      })
      .select()
      .single();

    if (accountError) {
      console.error('Error creating default account:', accountError);
      throw accountError;
    }

    // Crear suscripción free por defecto
    await req.supabase
      .from('subscriptions')
      .insert({ user_id: userId, plan: 'free', status: 'active' });

    return res.status(201).json({
      message: 'User setup complete',
      account: account
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
