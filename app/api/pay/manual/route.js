import { admin, getUser, price, commissionOf } from '@/lib/server';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const u = await getUser(req);
  if (!u) return Response.json({ error: "Connecte-toi d'abord" }, { status: 401 });
  const { phone, reference } = await req.json();
  const ref = String(reference || '').trim().toUpperCase();
  const ph = String(phone || '').replace(/\s/g, '');
  if (!/^[A-Z0-9.\-]{6,30}$/.test(ref)) return Response.json({ error: 'ID de transaction invalide' }, { status: 400 });
  if (!/^(\+?237)?6\d{8}$/.test(ph)) return Response.json({ error: 'Numéro invalide' }, { status: 400 });

  const db = admin();
  const { count } = await db.from('payments').select('id', { count: 'exact', head: true })
    .eq('user_id', u.id).eq('status', 'pending');
  if (count >= 3) return Response.json({ error: 'Trop de demandes en attente' }, { status: 429 });

  const amount = price();
  const { error } = await db.from('payments').insert({
    user_id: u.id, method: 'manual', amount, commission: commissionOf(amount), phone: ph, reference: ref,
  });
  if (error) {
    return Response.json({ error: error.code === '23505' ? 'Cet ID de transaction a déjà été utilisé' : 'Erreur, réessaie' }, { status: 400 });
  }
  return Response.json({ ok: true });
}
