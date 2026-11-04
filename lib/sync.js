import { admin } from './server';
import { fd, COMPETITIONS } from './football';
import { predictMatch } from './predict';

const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

// Importe les matchs réels + génère les prédictions des 5 prochains jours
export async function runSync() {
  const db = admin();
  const report = { imported: 0, predicted: 0, errors: [] };

  for (const code of COMPETITIONS) {
    try {
      const data = await fd(`/competitions/${code}/matches`);
      const now = new Date().toISOString();
      const rows = data.matches
        .filter((m) => m.homeTeam?.id && m.awayTeam?.id)
        .map((m) => ({
          id: m.id,
          competition_code: code,
          competition_name: data.competition?.name || code,
          utc_date: m.utcDate,
          status: m.status,
          home_id: m.homeTeam.id,
          away_id: m.awayTeam.id,
          home_name: m.homeTeam.shortName || m.homeTeam.name,
          away_name: m.awayTeam.shortName || m.awayTeam.name,
          home_crest: m.homeTeam.crest,
          away_crest: m.awayTeam.crest,
          home_goals: m.score?.fullTime?.home ?? null,
          away_goals: m.score?.fullTime?.away ?? null,
          updated_at: now,
        }));

      const teams = new Map();
      rows.forEach((r) => {
        teams.set(r.home_id, { id: r.home_id, name: r.home_name, crest: r.home_crest });
        teams.set(r.away_id, { id: r.away_id, name: r.away_name, crest: r.away_crest });
      });
      for (const c of chunk([...teams.values()], 500)) await db.from('teams').upsert(c);
      for (const c of chunk(rows, 300)) {
        const { error } = await db.from('matches').upsert(c);
        if (error) throw error;
      }
      report.imported += rows.length;

      const { data: fin } = await db
        .from('matches')
        .select('home_id,away_id,home_goals,away_goals')
        .eq('competition_code', code)
        .eq('status', 'FINISHED')
        .not('home_goals', 'is', null);

      const { data: next } = await db
        .from('matches')
        .select('id,home_id,away_id')
        .eq('competition_code', code)
        .in('status', ['SCHEDULED', 'TIMED'])
        .gte('utc_date', new Date().toISOString())
        .lte('utc_date', new Date(Date.now() + 5 * 86400000).toISOString());

      const preds = (next || []).map((m) => ({
        match_id: m.id,
        ...predictMatch(m.home_id, m.away_id, fin || []),
      }));
      if (preds.length) {
        const { error } = await db.from('predictions').upsert(preds);
        if (error) throw error;
        report.predicted += preds.length;
      }
    } catch (e) {
      report.errors.push(`${code}: ${e.message}`);
    }
  }
  return report;
                  }
