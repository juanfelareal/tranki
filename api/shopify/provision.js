import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-shared-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verificar secreto compartido
  const secret = req.headers['x-shared-secret'];
  if (!secret || secret !== process.env.SHOPIFY_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email es requerido' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar si el usuario ya existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      // Usuario existe → actualizar a Pro
      await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            user_id: existingUser.id,
            plan: 'pro',
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      return res.json({
        success: true,
        new_user: false,
        message: 'Usuario actualizado a Pro',
      });
    }

    // Usuario nuevo → crear con contraseña generada
    const password = crypto.randomBytes(10).toString('base64url');

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (createError) {
      throw createError;
    }

    // Crear cuenta default
    await supabaseAdmin.from('accounts').insert({
      user_id: newUser.user.id,
      name: 'Efectivo',
      type: 'cash',
      balance: 0,
      currency: 'COP',
      icon: '💵',
      color: '#22C55E',
    });

    // Crear suscripción Pro
    await supabaseAdmin.from('subscriptions').insert({
      user_id: newUser.user.id,
      plan: 'pro',
      status: 'active',
    });

    return res.json({
      success: true,
      new_user: true,
      password,
      message: 'Usuario creado con plan Pro',
    });
  } catch (error) {
    console.error('Provision error:', error);
    return res.status(500).json({ error: error.message });
  }
}
