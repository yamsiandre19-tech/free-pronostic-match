import { runSync } from '@/lib/sync';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'non autorisé' }, { status: 401 });
  }
  return Response.json(await runSync());
}
