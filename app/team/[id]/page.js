'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MatchCard from '@/components/MatchCard';

export default function Equipe() {
  const { id } = useParams();
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch(`/api/team/${id}`).then((r) => r.json()).then(setD);
  }, [id]);

  if (!d) return <div className="muted">Chargement…</div>;
  if (d.error) return <div className="muted">Équipe introuvable.</div>;

  return (
    <>
      <div className="row" style={{ justifyContent: 'flex-start' }}>
        {d.team.crest && <img src={d.team.crest} alt="" width="48" height="48" />}
        <h1 style={{ margin: 0 }}>{d.team.name}</h1>
      </div>

      <h2>Forme (5 derniers)</h2>
      <div>{d.form.map((f, i) => <span key={i} className={`badge ${f}`} style={{ marginRight: 6 }}>{f}</span>)}</div>

      <h2>Statistiques (10 derniers matchs)</h2>
      <div className="grid">
        <div className="stat"><b>{d.stats.avgFor}</b>Buts marqués / match</div>
        <div className="stat"><b>{d.stats.avgAg}</b>Buts encaissés / match</div>
        <div className="stat"><b>{d.stats.btts}%</b>Les 2 équipes marquent</div>
        <div className="stat"><b>{d.stats.over25}%</b>Plus de 2,5 buts</div>
      </div>

      <h2>Prochains matchs</h2>
      {d.next.length === 0 && <div className="muted">Aucun match programmé.</div>}
      {d.next.map((m) => <MatchCard key={m.id} m={m} showDate />)}

      <h2>Derniers résultats</h2>
      {d.last.map((m) => <MatchCard key={m.id} m={m} showDate />)}
    </>
  );
}
