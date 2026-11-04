import { activatePro } from './server';
import { omStatus } from './om';

// Vérifie un paiement automatique auprès d'Orange puis active le PRO (une seule fois)
export async function settle(db, pay) {
  if (pay.method !== 'auto' || pay.status !== 'pending') return pay.status;
  const s = await omStatus({ orderId: pay.order_id, amount: pay.amount, payToken: pay.pay_token });
  if (s === 'SUCCESS') {
    const { data } = await db
      .from('payments')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', pay.id)
      .eq('status', 'pending')
      .select();
    if (data?.length) await activatePro(db, pay.user_id);
    return 'verified';
  }
  if (s === 'FAILED' || s === 'EXPIRED') {
    await db.from('payments').update({ status: 'failed' }).eq('id', pay.id).eq('status', 'pending');
    return 'failed';
  }
  return 'pending';
               }
