import { useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../utils/api';

const SHOPIFY_URL = import.meta.env.VITE_SHOPIFY_PRODUCT_URL || 'https://gratu.co';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    try {
      const res = await subscriptionAPI.getStatus();
      setSubscription(res.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription({ plan: 'free', status: 'active' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

  const upgrade = () => {
    window.open(SHOPIFY_URL, '_blank');
  };

  return {
    subscription,
    loading,
    isPro,
    upgrade,
    refresh: loadSubscription,
  };
}
