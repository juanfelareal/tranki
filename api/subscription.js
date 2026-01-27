import { withAuth } from './_lib/auth.js';
import { getSubscription } from './_lib/subscription.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const subscription = await getSubscription(req.user.id);
    return res.json(subscription);
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler);
