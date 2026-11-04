export default function manifest() {
  return {
    name: 'GoalCraft Match Insights',
    short_name: 'GoalCraft',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b1220',
    theme_color: '#0b1220',
    icons: [
      { src: '/icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/icon/512', sizes: '512x512', type: 'image/png' },
    ],
  };
}
