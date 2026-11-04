const prod = () => process.env.OM_MODE === 'prod';
const base = () =>
  `https://api.orange.com/orange-money-webpay/${prod() ? process.env.OM_COUNTRY || 'cm' : 'dev'}/v1`;
const currency = () => (prod() ? 'XAF' : 'OUV'); // OUV = monnaie du sandbox

async function token() {
  const basic = Buffer.from(`${process.env.OM_CLIENT_ID}:${process.env.OM_CLIENT_SECRET}`).toString('base64');
  const r = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('authentification Orange refusée');
  return j.access_token;
}

export async function omCreate({ orderId, amount }) {
  const t = await token();
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const r = await fetch(`${base()}/webpayment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      merchant_key: process.env.OM_MERCHANT_KEY,
      currency: currency(),
      order_id: orderId,
      amount,
      return_url: `${site}/pro?order=${orderId}`,
      cancel_url: `${site}/pro?cancel=1`,
      notif_url: `${site}/api/pay/notify`,
      lang: 'fr',
      reference: 'GoalCraft PRO',
    }),
  });
  const j = await r.json();
  if (!j.payment_url) throw new Error(j.message || 'création du paiement refusée');
  return j;
}

// Vérifie le vrai statut auprès d'Orange : SUCCESS / FAILED / EXPIRED / PENDING / INITIATED
export async function omStatus({ orderId, amount, payToken }) {
  const t = await token();
  const r = await fetch(`${base()}/transactionstatus`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ order_id: orderId, amount, pay_token: payToken }),
  });
  const j = await r.json();
  return j.status;
}
