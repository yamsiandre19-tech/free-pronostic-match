import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'GoalCraft Match Insights',
  description: 'Prédictions football et statistiques avancées',
  icons: { icon: '/icon/192' },
};
export const viewport = { themeColor: '#0b1220', width: 'device-width', initialScale: 1 };

const items = [
  ['/', '🏠', 'Accueil'],
  ['/matches', '⚽', 'Matchs'],
  ['/standings', '🏆', 'Classement'],
  ['/pro', '⭐', 'PRO'],
  ['/profile', '👤', 'Profil'],
];

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
        <nav className="bottom">
          {items.map(([href, icon, label]) => (
            <Link key={href} href={href}><span>{icon}</span>{label}</Link>
          ))}
        </nav>
      </body>
    </html>
  );
    }
