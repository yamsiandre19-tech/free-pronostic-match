'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';

const STATUS = { pending: '⏳ En attente', verified: '✅ Validé', rejected: '❌ Rejeté', failed: '❌ Échoué' };

export default function Pro() {
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('auto');
  const [phone, setPhone] = useState('');
  const [ref, setRef] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => setD(await api('/api/me'));

  useEffect(() => {
    (async () => {
      const q = new URLSearchParams(window.location.search);
      const order = q.get('order');
      if (order) {
        setMsg('Vérification du paiement auprès d\'Orange Money…');
        const r = await api(`/api/pay/check?order=${order}`);
        setMsg(r.status === 'verified' ? '✅ Paiement confirmé, ton abonnement PRO est actif !'
          : r.status === 'failed' ? '❌ Paiement échoué ou expiré.'
          : '⏳ Paiement en cours de confirmation, reviens dans un instant.');
      }
      if (q.get('cancel')) setMsg('Paiement annulé.');
      load();
    })();
  }, []);

  if (!d) return <div className="muted">Chargement…</div>;
  const { user, config, payments } = d;

  const payAuto = async () => {
    setBusy(true); setMsg('');
    const r = await api('/api/pay/auto', { method: 'POST' });
    if (r.payment_url) window.location.href = r.payment_url;
    else { setMsg(r.error || 'Erreur'); setBusy(false); }
  };

  const payManual = async () => {
    setBusy(true); setMsg('');
    const r = await api('/api/pay/manual', { method: 'POST', body: JSON.stringify({ phone, reference: ref }) });
    setMsg(r.ok ? '✅ Demande envoyée. Ton PRO sera activé après vérification de ton paiement.' : r.error);
    setBusy(false);
    if (r.ok) { setRef(''); load(); }
  };

  return (
    <>
      <h1>⭐ Abonnement PRO</h1>
      <div className="banner">
        <div className="price">{config.price.toLocaleString('fr-FR')} FCFA</div>
        <div className="small">pour {config.days} jours</div>
      </div>

      <div className="card">
        <b>FREE</b> : 1N2, BTTS, Over/Under<br />
        <b>PRO</b> : tout FREE + 3 scores exacts par jour
      </div>

      {user?.plan === 'PRO' && (
        <div className="msg">✅ PRO actif jusqu'au {new Date(user.pro_until).toLocaleDateString('fr-FR')}</div>
      )}

      {!user ? (
        <Link href="/profile" className="btn">Connecte-toi pour t'abonner</Link>
      ) : (
        <>
          <div className="tabs">
            <button className={'tab' + (tab === 'auto' ? ' on' : '')} onClick={() => setTab('auto')}>Orange Money automatique</button>
            <button className={'tab' + (tab === 'manual' ? ' on' : '')} onClick={() => setTab('manual')}>Dépôt manuel</button>
          </div>

          {tab === 'auto' && (
            <div className="card">
              <p className="small muted">Tu es redirigé vers la page officielle Orange Money. Ton PRO s'active automatiquement dès que le paiement est confirmé.</p>
              <button onClick={payAuto} disabled={busy || !config.autoEnabled}>
                {config.autoEnabled ? `Payer ${config.price} FCFA` : 'Indisponible pour le moment'}
              </button>
            </div>
          )}

          {tab === 'manual' && (
            <div className="card">
              <p className="small">1. Envoie <b>{config.price} FCFA</b> par Orange Money au <b>{config.omNumber}</b>.<br />2. Saisis ton numéro et l'ID de transaction reçu par SMS.<br />3. Ton PRO est activé après vérification.</p>
              <input placeholder="Ton numéro Orange (6XXXXXXXX)" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
              <input placeholder="ID de transaction" value={ref} onChange={(e) => setRef(e.target.value)} />
              <button onClick={payManual} disabled={busy}>J'ai payé</button>
            </div>
          )}

          {msg && <div className="msg">{msg}</div>}

          {payments?.length > 0 && (
            <>
              <h2>Mes paiements</h2>
              {payments.map((p) => (
                <div key={p.id} className="card row">
                  <span>{p.method === 'auto' ? 'Automatique' : 'Manuel'} · {p.amount} FCFA</span>
                  <span className="small">{STATUS[p.status]}</span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
