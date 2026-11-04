import { admin } from '@/lib/server';
import { settle } from '@/lib/pay';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (body.notif_token) {
    const db = admin();
    const { data: pay } = await db.from('payments').select('*').eq('notif_token', body.notif_token).maybeSingle();
    // On ne fait pas confiance au message : settle() revérifie le statut réel chez Orange
    if (pay) await settle(db, pay).catch(() => {});
  }
  return Response.json({ ok: true });
}
