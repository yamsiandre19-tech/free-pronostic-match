const TZ = 'Africa/Douala';
export const hhmm = (d) =>
  new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
export const jour = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
export const pct = (v) => Math.round(Number(v) * 100) + '%';
