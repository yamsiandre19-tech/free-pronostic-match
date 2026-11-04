const BASE = 'https://api.football-data.org/v4';
export const COMPETITIONS = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL'];
export const COMP_NAMES = {
  PL: 'Premier League', PD: 'LaLiga', SA: 'Serie A',
  BL1: 'Bundesliga', FL1: 'Ligue 1', CL: 'Ligue des Champions',
};

export async function fd(path, revalidate = 0) {
  const res = await fetch(BASE + path, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN },
    ...(revalidate ? { next: { revalidate } } : { cache: 'no-store' }),
  });
  if (!res.ok) throw new Error(`football-data ${res.status} ${path}`);
  return res.json();
}
