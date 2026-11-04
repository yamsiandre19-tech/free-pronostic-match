import { fd, COMPETITIONS } from '@/lib/football';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const code = new URL(req.url).searchParams.get('code') || 'PL';
  if (!COMPETITIONS.includes(code)) return Response.json([]);
  try {
    const d = await fd(`/competitions/${code}/standings`, 1800);
    const t = d.standings.find((s) => s.type === 'TOTAL') || d.standings[0];
    return Response.json(t?.table || []);
  } catch {
    return Response.json([]);
  }
}
