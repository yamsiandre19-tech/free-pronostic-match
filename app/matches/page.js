'use client';
import { useEffect, useState } from 'react';
import MatchCard from '@/components/MatchCard';
import { api } from '@/lib/client';

const TABS = [['today', "Aujourd'hui"], ['upcoming', 'À venir'], ['live', 'En direct']];

export default function Matchs() {
  const [scope, setScope] = useState('today');
  const [list, setList] = useState(null);

  useEffect(() => {
    setList(null);
    const load = async () => { const r = await api(`/api/matches?scope=${scope}`); setList(Array.isArray(r) ? r : []); };
    load();
    if (scope === 'live') { const i = setInterval(load, 60000); return () => clearInterval(i); }
  }, [scope]);

  return (
    <>
      <h1>Matchs</h1>
      <div className="tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={'tab' + (scope === k ? ' on' : '')} onClick={() => setScope(k)}>{label}</button>
        ))}
      </div>
      {list === null && <div className="muted">Chargement…</div>}
      {list && list.length === 0 && <div className="muted">Aucun match.</div>}
      {list && list.map((m) => <MatchCard key={m.id} m={m} showDate={scope === 'upcoming'} />)}
    </>
  );
    }
