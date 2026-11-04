import { admin } from '@/lib/server';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const id = Number(params.id);
  if (!id) return Response.json({ error: 'id invalide' }, { status: 400 });
  const db = admin();
  const { data: team } = await db.from('teams').select('*').eq('id', id).maybeSingle();
  if (!team) return Response.json({ error: 'introuvable' }, { status: 404 });

  const { data: fin } = await db.from('matches').select('*')
    .or(`home_id.eq.${id},away_id.eq.${id}`).eq('status', 'FINISHED')
    .order('utc_date', { ascending: false }).limit(10);
  const { data: next } = await db.from('matches').select('*')
    .or(`home_id.eq.${id},away_id.eq.${id}`).in('status', ['SCHEDULED', 'TIMED'])
    .gte('utc_date', new Date().toISOString()).order('utc_date').limit(3);

  const res = (m) => {
    const home = m.home_id === id;
    return { gf: home ? m.home_goals : m.away_goals, ga: home ? m.away_goals : m.home_goals };
  };
  const list = fin || [];
  const form = list.slice(0, 5).map((m) => { const { gf, ga } = res(m); return gf > ga ? 'V' : gf < ga ? 'D' : 'N'; });
  const n = list.length || 1;
  const sum = (f) => list.reduce((s, m) => s + f(m), 0);
  const stats = {
    avgFor: (sum((m) => res(m).gf) / n).toFixed(1),
    avgAg: (sum((m) => res(m).ga) / n).toFixed(1),
    btts: Math.round((sum((m) => (m.home_goals > 0 && m.away_goals > 0 ? 1 : 0)) / n) * 100),
    over25: Math.round((sum((m) => (m.home_goals + m.away_goals > 2 ? 1 : 0)) / n) * 100),
  };
  return Response.json({ team, form, stats, last: list.slice(0, 5), next: next || [] });
                 }
