import { admin, getUser, activatePro } from '@/lib/server';
export const dynamic = 'force-dynamic';

async function guard(req) {
  const u = await getUser(req);
  return u && u.role === 'admin' ? u : null;
}

export async function GET(req) {
  if (!(await guard(req))) return Response.json({ error: 'interdit' }, { status: 403 });
  const { data } = await admin().from('payments').select('*, profiles(email)')
    .order('created_at', { ascending: false }).limit(50);
  return Response.json({ payments: data || [] });
}

export async function POST(req) {
  if (!(await guard(req))) return Response.json({ error: 'interdit' }, { status: 403 });
  const { id, action } = await req.json();
  const db = admin();
  if (action === 'reject') {
    await db.from('payments').update({ status: 'rejected' }).eq('id', id).eq('status', 'pending');
    return Response.json({ ok: true });
  }
  if (action === 'approve') {
    const { data } = await db.from('payments')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', id).eq('status', 'pending').eq('method', 'manual').select();
    if (!data?.length) return Response.json({ error: 'Paiement introuvable ou déjà traité' }, { status: 400 });
    await activatePro(db, data[0].user_id);
    return Response.json({ ok: true });
  }
  return Response.json({ error: 'action inconnue' }, { status: 400 });
}
