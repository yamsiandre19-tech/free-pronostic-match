import { admin, getUser, price } from '@/lib/server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const u = await getUser(req);
  const config = {
    price: price(),
    days: Number(process.env.PRO_DAYS || 30),
    omNumber: process.env.OM_NUMBER || '',
    autoEnabled: !!process.env.OM_CLIENT_ID,
  };
  if (!u) return Response.json({ user: null, config });
  const { data: payments } = await admin()
    .from('payments')
    .select('id,method,amount,status,reference,created_at')
    .eq('user_id', u.id)
    .order('created_at', { ascending: false })
    .limit(5);
  return Response.json({
    user: { email: u.email, role: u.role, plan: u.isPro ? 'PRO' : 'FREE', pro_until: u.pro_until },
    payments,
    config,
  });
}
