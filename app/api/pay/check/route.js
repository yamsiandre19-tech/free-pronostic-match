import { admin, getUser } from '@/lib/server';
import { settle } from '@/lib/pay';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const u = await getUser(req);
  if (!u) return Response.json({ error: 'non connecté' }, { status: 401 });
  const order = new URL(req.url).searchParams.get('order');
  const db = admin();
  const { data: pay } = await db.from('payments').select('*').eq('order_id', order).eq('user_id', u.id).maybeSingle();
  if (!pay) return Response.json({ error: 'introuvable' }, { status: 404 });
  const status = await settle(db, pay).catch(() => pay.status);
  return Response.json({ status });
}
