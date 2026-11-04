import { admin, getUser } from '@/lib/server';
import { fd } from '@/lib/football';
export const dynamic = 'force-dynamic';

const DAY = 86400000;
// Journée du Cameroun (UTC+1)
function dayRange() {
  const start = Math.floor((Date.now() + 3600000) / DAY) * DAY - 3600000;
  return [new Date(start), new Date(start + DAY)];
}
const dayKey = (d) => new Date(new Date(d).getTime() + 3600000).toISOString().slice(0, 10);

export async function GET(req) {
  const scope = new URL(req.url).searchParams.get('scope') || 'today';

  if (scope === 'live') {
    try {
      const d = await fd('/matches?status=LIVE', 45);
      return Response.json(
        d.matches.map((m) => ({
          id: m.id, competition_name: m.competition?.name, utc_date: m.utcDate, status: m.status,
          home_id: m.homeTeam.id, away_id: m.awayTeam.id,
          home_name: m.homeTeam.shortName || m.homeTeam.name, away_name: m.awayTeam.shortName || m.awayTeam.name,
          home_crest: m.homeTeam.crest, away_crest: m.awayTeam.crest,
          home_goals: m.score?.fullTime?.home ?? null, away_goals: m.score?.fullTime?.away ?? null,
          prediction: null,
        }))
      );
    } catch {
      return Response.json([]);
    }
  }

  const user = await getUser(req);
  const canSeeScores = user && (user.isPro || user.role === 'admin');
  const [start, end] = dayRange();
  let q = admin().from('matches').select('*, predictions(*)').order('utc_date');
  q = scope === 'today'
    ? q.gte('utc_date', start.toISOString()).lt('utc_date', end.toISOString())
    : q.gte('utc_date', end.toISOString()).lt('utc_date', new Date(end.getTime() + 7 * DAY).toISOString());
  const { data: rows } = await q;

  const pred = (m) => (Array.isArray(m.predictions) ? m.predictions[0] : m.predictions);

  // PRO : 3 scores exacts par jour = les 3 matchs les plus fiables de la journée
  const byDay = {};
  (rows || []).forEach((m) => { if (pred(m)) (byDay[dayKey(m.utc_date)] ||= []).push(m); });
  const flagged = new Set();
  Object.values(byDay).forEach((list) =>
    list.sort((a, b) => pred(b).confidence - pred(a).confidence).slice(0, 3).forEach((m) => flagged.add(m.id))
  );

  const out = (rows || []).map((m) => {
    const { predictions, ...rest } = m;
    const p = pred(m);
    let prediction = null;
    if (p) {
      const pro_pick = flagged.has(m.id);
      prediction = {
        p_home: p.p_home, p_draw: p.p_draw, p_away: p.p_away, pick_1n2: p.pick_1n2,
        btts_yes: p.btts_yes, pick_btts: p.pick_btts, over25: p.over25, pick_ou: p.pick_ou,
        pro_pick,
        top_scores: canSeeScores && pro_pick ? p.top_scores : null, // jamais envoyé aux comptes FREE
      };
    }
    return { ...rest, prediction };
  });
  return Response.json(out);
    }
