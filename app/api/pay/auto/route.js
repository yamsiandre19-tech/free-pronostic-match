import { admin, getUser, price, commissionOf } from '@/lib/server';
import { omCreate } from '@/lib/om';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const u = await getUser(req);
  if (!u) return Response.json({ error: "Connecte-toi d'abord" }, { status: 401 });
  if (!process.env.OM_CLIENT_ID) return Response.json({ error: 'Paiement automatique non configuré' }, { status: 400 });

  const db = admin();
  const amount = price();
  const orderId = 'GC' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const { data: pay, error } = await db.from('payments')
    .insert({ user_id: u.id, method: 'auto', amount, commission: commissionOf(amount), order_id: orderId })
    .select().single();
  if (error) return Response.json({ error: 'Erreur, réessaie' }, { status: 500 });

  try {
    const om = await omCreate({ orderId, amount });
    await db.from('payments').update({ pay_token: om.pay_token, notif_token: om.notif_token }).eq('id', pay.id);
    return Response.json({ payment_url: om.payment_url });
  } catch (e) {
    await db.from('payments').update({ status: 'failed' }).eq('id', pay.id);
    return Response.json({ error: 'Orange Money indisponible : ' + e.message }, { status: 502 });
  }
}
