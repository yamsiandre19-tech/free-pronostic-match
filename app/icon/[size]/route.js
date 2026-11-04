import { ImageResponse } from 'next/og';

export async function GET(req, { params }) {
  const s = Number(params.size) || 192;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg,#0b1220,#2f7bff)', color: '#fff', fontSize: s * 0.55, fontWeight: 800,
        }}
      >
        G
      </div>
    ),
    { width: s, height: s }
  );
}
