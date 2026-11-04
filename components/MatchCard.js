import Link from 'next/link';
import { hhmm, jour, pct } from '@/lib/format';

export default function MatchCard({ m, showDate }) {
  const p = m.prediction;
  const hasScore = m.home_goals != null && m.away_goals != null;
  const live = m.status === 'IN_PLAY' || m.status === 'PAUSED';
  const pickProb = p ? (p.pick_1n2 === '1' ? p.p_home : p.pick_1n2 === '2' ? p.p_away : p.p_draw) : 0;

  return (
    <div className="card">
      <div className="muted small">
        {m.competition_name} · {showDate ? jour(m.utc_date) + ' · ' : ''}{hhmm(m.utc_date)}{' '}
        {live && <span className="live">● EN DIRECT</span>}
      </div>
      <div className="teams">
        <Link href={`/team/${m.home_id}`} className="team">
          {m.home_crest && <img src={m.home_crest} alt="" width="30" height="30" />}
          <span>{m.home_name}</span>
        </Link>
        <div className="score">{hasScore ? `${m.home_goals} - ${m.away_goals}` : 'vs'}</div>
        <Link href={`/team/${m.away_id}`} className="team">
          {m.away_crest && <img src={m.away_crest} alt="" width="30" height="30" />}
          <span>{m.away_name}</span>
        </Link>
      </div>
      {p && (
        <div className="chips">
          <span className="chip">1N2 : {p.pick_1n2} ({pct(pickProb)})</span>
          <span className="chip">BTTS : {p.pick_btts} ({pct(p.btts_yes)})</span>
          <span className="chip">{p.pick_ou} ({pct(p.over25)})</span>
          {p.top_scores && (
            <span className="chip pro">⭐ Scores : {p.top_scores.map((s) => s.score).join(' · ')}</span>
          )}
          {!p.top_scores && p.pro_pick && <span className="chip lock">🔒 Scores exacts PRO</span>}
        </div>
      )}
    </div>
  );
}
