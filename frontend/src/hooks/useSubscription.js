import { useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../utils/api';

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

  const upgrade = async () => {
    try {
      const res = await subscriptionAPI.createCheckout();
      window.location.href = res.data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Error al iniciar el proceso de pago');
    }
  };

  const manageSubscription = async () => {
    try {
      const res = await subscriptionAPI.createPortal();
      window.location.href = res.data.url;
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Error al abrir el portal de suscripción');
    }
  };

  return {
    subscription,
    loading,
    isPro,
    upgrade,
    manageSubscription,
    refresh: loadSubscription,
  };
}
