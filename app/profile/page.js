'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/client';

export default function Profil() {
  const [me, setMe] = useState(undefined);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => { const r = await api('/api/me'); setMe(r.user || null); };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setMsg('');
    const { data, error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password: pwd })
      : await supabase.auth.signUp({ email, password: pwd });
    if (error) return setMsg(error.message);
    if (mode === 'signup' && !data.session) return setMsg('Compte créé. Confirme ton e-mail puis connecte-toi.');
    load();
  };

  const logout = async () => { await supabase.auth.signOut(); setMe(null); };

  if (me === undefined) return <div className="muted">Chargement…</div>;

  if (!me) {
    return (
      <>
        <h1>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1>
        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe (6 caractères min.)" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        <button onClick={submit}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
        {msg && <div className="msg">{msg}</div>}
        <button className="ghost" style={{ marginTop: 10 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Pas de compte ? Créer un compte' : 'Déjà inscrit ? Se connecter'}
        </button>
      </>
    );
  }

  return (
    <>
      <h1>👤 Mon profil</h1>
      <div className="card">
        <div>{me.email}</div>
        <div style={{ marginTop: 6 }}>
          Plan : <b>{me.plan}</b>
          {me.plan === 'PRO' && <span className="muted"> · jusqu'au {new Date(me.pro_until).toLocaleDateString('fr-FR')}</span>}
        </div>
      </div>
      {me.plan !== 'PRO' && <Link href="/pro" className="btn" style={{ marginBottom: 10 }}>Passer en PRO</Link>}
      {me.role === 'admin' && <Link href="/admin" className="btn ghost" style={{ marginBottom: 10 }}>🛠 Administration</Link>}
      <button className="ghost" onClick={logout}>Se déconnecter</button>
    </>
  );
    }
