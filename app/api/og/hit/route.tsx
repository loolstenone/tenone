import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const DISC_COLORS: Record<string, string> = {
  D: '#E53935',
  I: '#FFB300',
  S: '#43A047',
  C: '#1E88E5',
};

function getDiscColor(typeCode: string): string {
  const first = typeCode.charAt(0).toUpperCase();
  return DISC_COLORS[first] ?? '#E53935';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeCode = searchParams.get('type') || 'D-INTJ';
  const typeName = searchParams.get('name') || '';
  const nickname = searchParams.get('nick') || '';

  const accentColor = getDiscColor(typeCode);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200',
          height: '630',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* DISC color accent bar at top */}
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: accentColor,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '60px 80px',
          }}
        >
          {/* HeRo logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginBottom: '40px',
            }}
          >
            <span
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a1a1a',
                letterSpacing: '-0.5px',
              }}
            >
              He
            </span>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#E53935',
                letterSpacing: '-0.5px',
              }}
            >
              R
            </span>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a1a1a',
                letterSpacing: '-0.5px',
              }}
            >
              o
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#999999',
                marginLeft: '12px',
              }}
            >
              Talent Agency
            </span>
          </div>

          {/* Type code - big text */}
          <div
            style={{
              fontSize: '96px',
              fontWeight: 800,
              color: accentColor,
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: '16px',
            }}
          >
            {typeCode}
          </div>

          {/* Type name in Korean */}
          {typeName && (
            <div
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: '12px',
              }}
            >
              {typeName}
            </div>
          )}

          {/* Nickname badge */}
          {nickname && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 24px',
                backgroundColor: accentColor,
                borderRadius: '50px',
                marginTop: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                {nickname}
              </span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px 80px',
            borderTop: '1px solid #E5E5E5',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              color: '#999999',
              fontWeight: 500,
            }}
          >
            HeRo Talent Agency | hero.ne.kr/hit
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
