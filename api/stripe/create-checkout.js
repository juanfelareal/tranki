import { withAuth } from '../_lib/auth.js';
import { stripe } from '../_lib/stripe.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Verificar si ya tiene un stripe_customer_id
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id, plan')
      .eq('user_id', userId)
      .single();

    if (sub?.plan === 'pro') {
      return res.status(400).json({ error: 'Ya tienes el plan Pro' });
    }

    let customerId = sub?.stripe_customer_id;

    // Crear customer en Stripe si no existe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId }
      });
      customerId = customer.id;

      // Guardar customer_id
      await supabaseAdmin
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/app/configuracion?upgrade=success`,
      cancel_url: `${req.headers.origin}/app/configuracion?upgrade=cancel`,
      metadata: { user_id: userId },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
