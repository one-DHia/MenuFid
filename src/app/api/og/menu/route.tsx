import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    let businessName = 'Menu Digital';
    let city = '';
    let country = '';
    let logoUrl = '';

    if (slug) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/merchants?slug=eq.${encodeURIComponent(slug)}&select=business_name,city,country,logo_url`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
              cache: 'no-store',
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data[0]) {
              businessName = data[0].business_name || 'Restaurant';
              city = data[0].city || '';
              country = data[0].country || '';
              logoUrl = data[0].logo_url || '';
            }
          }
        } catch (e) {
          console.warn('[OG direct fetch error]:', e);
        }
      }
    }

    const locationText = [city, country].filter(Boolean).join(', ');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAFA',
            padding: '48px 56px',
            fontFamily: 'sans-serif',
            border: '16px solid #000000',
            position: 'relative',
          }}
        >
          {/* Background Decorative Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '420px',
              height: '100%',
              backgroundColor: '#FFB800',
              borderLeft: '8px solid #000000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                border: '5px solid #000000',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '8px 8px 0px #000000',
                width: '280px',
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  lineHeight: '1',
                  marginBottom: '8px',
                }}
              >
                🍽️
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#000000',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                }}
              >
                Menu Digital
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#555555',
                  marginTop: '4px',
                }}
              >
                📱 Scannez & Commandez
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#00F59B',
                border: '4px solid #000000',
                borderRadius: '999px',
                padding: '10px 20px',
                boxShadow: '4px 4px 0px #000000',
              }}
            >
              <div style={{ fontSize: '18px' }}>🎁</div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#000000',
                  textTransform: 'uppercase',
                }}
              >
                Fidélité Récompensée
              </div>
            </div>
          </div>

          {/* Left Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '620px',
              zIndex: 10,
            }}
          >
            {/* Top Brand Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                }}
              >
                <span>⚡</span>
                <span>MENUFID</span>
              </div>
              {locationText ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #000000',
                    color: '#000000',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 800,
                    boxShadow: '3px 3px 0px #000000',
                  }}
                >
                  <span>📍</span>
                  <span>{locationText}</span>
                </div>
              ) : null}
            </div>

            {/* Restaurant Avatar / Logo + Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '20px',
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessName}
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '24px',
                    border: '5px solid #000000',
                    boxShadow: '6px 6px 0px #000000',
                    objectFit: 'cover',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '24px',
                    backgroundColor: '#FFB800',
                    border: '5px solid #000000',
                    boxShadow: '6px 6px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '44px',
                    fontWeight: 900,
                    color: '#000000',
                  }}
                >
                  {businessName.charAt(0).toUpperCase()}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: 900,
                    color: '#000000',
                    letterSpacing: '-1.5px',
                    lineHeight: '1.1',
                    maxHeight: '94px',
                    overflow: 'hidden',
                  }}
                >
                  {businessName}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#FF4747',
                    textTransform: 'uppercase',
                    marginTop: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  ★ Carte & Menu en ligne
                </div>
              </div>
            </div>

            {/* Catchphrase */}
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#333333',
                lineHeight: '1.4',
                marginTop: '12px',
              }}
            >
              Consultez notre menu digital, nos spécialités et cumulez vos points fidélité en direct.
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '620px',
              borderTop: '3px solid #000000',
              paddingTop: '20px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 800,
                color: '#000000',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '999px',
                  backgroundColor: '#00F59B',
                  border: '2px solid #000000',
                }}
              />
              <span>Menu interactif mis à jour en temps réel</span>
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#000000',
                letterSpacing: '-0.2px',
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
    console.error('[OG Image Error]:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
