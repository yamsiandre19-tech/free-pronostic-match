'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [pays, setPays] = useState([]);
  const [msg, setMsg] = useState('');
  const [denied, setDenied] = useState(false);

  const load = async () => {
    const s = await api('/api/admin/stats');
    if (s.error) return setDenied(true);
    setStats(s);
    const p = await api('/api/admin/payments');
    setPays(p.payments || []);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id, action) => {
    if (action === 'approve' && !confirm("Confirme que l'argent est bien reçu sur ton compte Orange Money avec cet ID de transaction.")) return;
    const r = await api('/api/admin/payments', { method: 'POST', body: JSON.stringify({ id, action }) });
    setMsg(r.ok ? 'Fait ✔' : r.error);
    load();
  };

  const sync = async () => {
    setMsg('Synchronisation en cours (jusqu\'à 1 minute)…');
    const r = await api('/api/admin/sync', { method: 'POST' });
    setMsg(r.error || `Importés : ${r.imported} · Prédictions : ${r.predicted}${r.errors?.length ? ' · Erreurs : ' + r.errors.join(' | ') : ''}`);
    load();
  };

  if (denied) return <div className="msg">Accès réservé à l'administrateur.</div>;
  if (!stats) return <div className="muted">Chargement…</div>;

  return (
    <>
      <h1>🛠 Administration</h1>
      <div className="grid">
        <div className="stat"><b>{stats.users}</b>Utilisateurs</div>
        <div className="stat"><b>{stats.pro}</b>PRO actifs</div>
        <div className="stat"><b>{stats.revenue.toLocaleString('fr-FR')}</b>Revenus (FCFA)</div>
        <div className="stat"><b>{stats.net.toLocaleString('fr-FR')}</b>Net après commissions</div>
        <div className="stat"><b>{stats.matches}</b>Matchs</div>
        <div className="stat"><b>{stats.predictions}</b>Prédictions</div>
      </div>

      <button style={{ margin: '14px 0' }} onClick={sync}>🔄 Synchroniser maintenant</button>
      {msg && <div className="msg">{msg}</div>}

      <h2>Paiements</h2>
      {pays.length === 0 && <div className="muted">Aucun paiement.</div>}
      {pays.map((p) => (
        <div key={p.id} className="card">
          <div className="row">
            <b>{p.amount} FCFA</b>
            <span className="small">{p.status}</span>
          </div>
          <div className="small muted">
            {p.profiles?.email} · {p.method === 'auto' ? 'Automatique' : 'Manuel'}
            {p.phone && ` · ${p.phone}`}{p.reference && ` · ID ${p.reference}`}
            <br />Commission : {p.commission} FCFA · {new Date(p.created_at).toLocaleString('fr-FR')}
          </div>
          {p.status === 'pending' && p.method === 'manual' && (
            <div className="row" style={{ marginTop: 8 }}>
              <button className="small green" onClick={() => decide(p.id, 'approve')}>Valider</button>
              <button className="small red" onClick={() => decide(p.id, 'reject')}>Rejeter</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
           }
