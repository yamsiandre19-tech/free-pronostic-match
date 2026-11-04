'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const COMPS = [['PL', 'Premier League'], ['PD', 'LaLiga'], ['SA', 'Serie A'], ['BL1', 'Bundesliga'], ['FL1', 'Ligue 1'], ['CL', 'C1']];

export default function Classement() {
  const [code, setCode] = useState('PL');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    fetch(`/api/standings?code=${code}`).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : []));
  }, [code]);

  return (
    <>
      <h1>Classement</h1>
      <div className="tabs">
        {COMPS.map(([k, label]) => (
          <button key={k} className={'tab' + (code === k ? ' on' : '')} onClick={() => setCode(k)}>{label}</button>
        ))}
      </div>
      {rows === null && <div className="muted">Chargement…</div>}
      {rows && (
        <div className="card" style={{ padding: 6 }}>
          <table>
            <thead><tr><th>#</th><th className="l">Équipe</th><th>J</th><th>Diff</th><th>Pts</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.team.id}>
                  <td>{t.position}</td>
                  <td className="l">
                    <Link href={`/team/${t.team.id}`}>
                      {t.team.crest && <img src={t.team.crest} alt="" width="18" height="18" style={{ verticalAlign: 'middle', marginRight: 6 }} />}
                      {t.team.shortName || t.team.name}
                    </Link>
                  </td>
                  <td>{t.playedGames}</td>
                  <td>{t.goalDifference}</td>
                  <td><b>{t.points}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
        }
