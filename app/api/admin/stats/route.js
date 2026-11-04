import { admin, getUser } from '@/lib/server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const u = await getUser(req);
  if (!u || u.role !== 'admin') return Response.json({ error: 'interdit' }, { status: 403 });
  const db = admin();
  const count = async (q) => (await q).count || 0;
  const head = { count: 'exact', head: true };
  const [users, pro, matches, predictions, { data: ok }] = await Promise.all([
    count(db.from('profiles').select('id', head)),
    count(db.from('profiles').select('id', head).eq('plan', 'PRO').gt('pro_until', new Date().toISOString())),
    count(db.from('matches').select('id', head)),
    count(db.from('predictions').select('match_id', head)),
    db.from('payments').select('amount,commission').eq('status', 'verified'),
  ]);
  const revenue = (ok || []).reduce((s, p) => s + p.amount, 0);
  const commissions = (ok || []).reduce((s, p) => s + p.commission, 0);
  return Response.json({ users, pro, matches, predictions, revenue, net: revenue - commissions });
}
