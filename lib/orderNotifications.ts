import { supabase } from './supabase';

export const sendOrderNotification = async (order: Record<string, any>) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Chýba prihlasovací token pre odoslanie notifikácie');
  }

  const response = await fetch('/api/send-order-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ order })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Nepodarilo sa odoslať e-mailovú notifikáciu');
  }

  return result;
};
