// Modèle de Poisson basé sur les statistiques historiques (buts marqués / encaissés)
const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const pois = (k, l) => (Math.exp(-l) * Math.pow(l, k)) / fact(k);
const avg = (arr, f) => (arr.length ? arr.reduce((s, x) => s + f(x), 0) / arr.length : null);
// Peu de matchs → on se rapproche de la moyenne du championnat
const blend = (v, n, lg) => { const w = Math.min(1, n / 8); return v == null ? lg : w * v + (1 - w) * lg; };
const r3 = (x) => Math.round(x * 1000) / 1000;

export function predictMatch(homeId, awayId, finished) {
  const lgH = avg(finished, (m) => m.home_goals) || 1.4;
  const lgA = avg(finished, (m) => m.away_goals) || 1.1;
  const hs = finished.filter((m) => m.home_id === homeId);
  const aw = finished.filter((m) => m.away_id === awayId);
  const hFor = blend(avg(hs, (m) => m.home_goals), hs.length, lgH);
  const hAg = blend(avg(hs, (m) => m.away_goals), hs.length, lgA);
  const aFor = blend(avg(aw, (m) => m.away_goals), aw.length, lgA);
  const aAg = blend(avg(aw, (m) => m.home_goals), aw.length, lgH);
  const lh = Math.max(0.2, (hFor * aAg) / lgH);
  const la = Math.max(0.2, (aFor * hAg) / lgA);

  let pH = 0, pD = 0, pA = 0, btts = 0, o25 = 0, tot = 0;
  const scores = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = pois(i, lh) * pois(j, la);
      tot += p;
      if (i > j) pH += p; else if (i === j) pD += p; else pA += p;
      if (i > 0 && j > 0) btts += p;
      if (i + j > 2) o25 += p;
      scores.push({ score: `${i}-${j}`, p });
    }
  }
  scores.sort((a, b) => b.p - a.p);
  const ph = r3(pH / tot), pd = r3(pD / tot), pa = r3(pA / tot);
  const max = Math.max(ph, pd, pa);
  return {
    p_home: ph, p_draw: pd, p_away: pa,
    pick_1n2: max === ph ? '1' : max === pa ? '2' : 'N',
    btts_yes: r3(btts / tot), pick_btts: btts / tot >= 0.5 ? 'Oui' : 'Non',
    over25: r3(o25 / tot), pick_ou: o25 / tot >= 0.5 ? 'Plus de 2,5' : 'Moins de 2,5',
    top_scores: scores.slice(0, 3).map((x) => ({ score: x.score, p: r3(x.p / tot) })),
    confidence: max,
  };
       }
