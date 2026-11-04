import { supabase } from './supabase';

// Appelle nos routes /api en joignant le jeton de l'utilisateur connecté
export async function api(path, opts = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    cache: 'no-store',
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  return res.json();
}
