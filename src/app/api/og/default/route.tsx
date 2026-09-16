import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FFB800',
            padding: '48px 56px',
            fontFamily: 'sans-serif',
            border: '16px solid #000000',
            position: 'relative',
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '999px',
                fontSize: '22px',
                fontWeight: 900,
                letterSpacing: '1px',
              }}
            >
              <span>⚡</span>
              <span>MENUFID</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: '4px solid #000000',
                padding: '10px 22px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 900,
                boxShadow: '4px 4px 0px #000000',
              }}
            >
              <span>🚀</span>
              <span>Menu QR & Carte de Fidélité PWA</span>
            </div>
          </div>

          {/* Center Main Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#FFFFFF',
              border: '6px solid #000000',
              borderRadius: '28px',
              padding: '36px 44px',
              boxShadow: '10px 10px 0px #000000',
            }}
          >
            <div
              style={{
                fontSize: '46px',
                fontWeight: 900,
                color: '#000000',
                lineHeight: '1.15',
                letterSpacing: '-1.5px',
              }}
            >
              Digitalisez votre Menu & Fidélisez vos Clients en 1 Clic
            </div>

            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#444444',
                lineHeight: '1.4',
              }}
            >
              Solution clé en main pour restaurants : Menu interactif instantané, QR codes personnalisés et carte de fidélité mobile sans application à télécharger.
            </div>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#00F59B',
                  border: '3px solid #000000',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 900,
                  boxShadow: '3px 3px 0px #000000',
                }}
              >
                ✓ Menu QR Code Haute Définition
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#93C5FD',
                  border: '3px solid #000000',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 900,
                  boxShadow: '3px 3px 0px #000000',
                }}
              >
                ✓ Carte de Fidélité Sans App
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F9A8D4',
                  border: '3px solid #000000',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 900,
                  boxShadow: '3px 3px 0px #000000',
                }}
              >
                ✓ Dashboard Pro & Scanner QR
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#000000',
              }}
            >
              Disponible sur tous les smartphones iOS & Android
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#000000',
                letterSpacing: '-0.5px',
              }}
            >
              www.menufid.site
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('[OG Image Default Error]:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
