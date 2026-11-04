import { createClient } from '@supabase/supabase-js';

export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

export const isPro = (p) => p.plan === 'PRO' && p.pro_until && new Date(p.pro_until) > new Date();

// Retourne le profil de l'utilisateur à partir du jeton Bearer (ou null)
export async function getUser(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!token) return null;
  const db = admin();
  const { data } = await db.auth.getUser(token);
  if (!data?.user) return null;
  const { data: profile } = await db.from('profiles').select('*').eq('id', data.user.id).single();
  return profile ? { ...profile, isPro: isPro(profile) } : null;
}

// Active (ou prolonge) le PRO
export async function activatePro(db, userId) {
  const days = Number(process.env.PRO_DAYS || 30);
  const { data: p } = await db.from('profiles').select('pro_until').eq('id', userId).single();
  const base = p?.pro_until && new Date(p.pro_until) > new Date() ? new Date(p.pro_until) : new Date();
  base.setDate(base.getDate() + days);
  await db.from('profiles').update({ plan: 'PRO', pro_until: base.toISOString() }).eq('id', userId);
}

export const price = () => Number(process.env.PRO_PRICE || 2500);
export const commissionOf = (amount) => Math.round(amount * Number(process.env.COMMISSION_RATE || 0));
