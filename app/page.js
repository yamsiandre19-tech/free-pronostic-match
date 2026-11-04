'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MatchCard from '@/components/MatchCard';
import { api } from '@/lib/client';

export default function Accueil() {
  const [live, setLive] = useState([]);
  const [today, setToday] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [l, t] = await Promise.all([api('/api/matches?scope=live'), api('/api/matches?scope=today')]);
      setLive(Array.isArray(l) ? l : []);
      setToday(Array.isArray(t) ? t : []);
      setReady(true);
    };
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  return (
    <>
      <h1>⚽ GoalCraft Match Insights</h1>
      <div className="banner">
        <b>Passe en PRO</b>
        <div className="small">Scores exacts du jour et analyses avancées.</div>
        <Link href="/pro" className="btn ghost" style={{ marginTop: 10 }}>Voir l'abonnement</Link>
      </div>

      {live.length > 0 && (
        <>
          <h2>En direct</h2>
          {live.map((m) => <MatchCard key={m.id} m={m} />)}
        </>
      )}

      <h2>Matchs du jour</h2>
      {!ready && <div className="muted">Chargement…</div>}
      {ready && today.length === 0 && <div className="muted">Aucun match aujourd'hui.</div>}
      {today.slice(0, 6).map((m) => <MatchCard key={m.id} m={m} />)}
      {today.length > 6 && <Link href="/matches" className="btn ghost">Voir tous les matchs</Link>}

      <p className="notice">Les prédictions sont des estimations statistiques, sans aucune garantie de résultat. Joue de façon responsable.</p>
    </>
  );
    }
