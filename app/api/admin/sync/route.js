import { getUser } from '@/lib/server';
import { runSync } from '@/lib/sync';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const u = await getUser(req);
  if (!u || u.role !== 'admin') return Response.json({ error: 'interdit' }, { status: 403 });
  return Response.json(await runSync());
}
