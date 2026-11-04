import React from 'react';
import { useCurrentFrame, Img, staticFile } from 'remotion';

interface ArtworkHeroCardProps {
  artworkUrl?: string;
  shape?: 'book-cover' | 'circle' | 'square';
  artworkWidth?: number;
  title?: string;
  authorName?: string;
  accentColor?: string;
  loopDurationFrames?: number;
}

export const ArtworkHeroCard: React.FC<ArtworkHeroCardProps> = ({
  artworkUrl,
  shape = 'book-cover',
  artworkWidth = 420,
  title = 'စာအုပ်အမည်',
  authorName = 'စာရေးသူ',
  accentColor = '#a855f7',
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // Smooth floating motion on Y axis (2 cycles per loop, perfectly seamless at t=0 and t=1)
  const floatY = Math.sin(t * 2 * Math.PI * 2) * 8;
  const tiltY = Math.sin(t * 2 * Math.PI * 1) * 3;
  const tiltX = Math.cos(t * 2 * Math.PI * 1) * 2;

  // Resolve artwork source (data URL, HTTP URL, or static file)
  const resolvedSrc = artworkUrl
    ? artworkUrl.startsWith('data:') || artworkUrl.startsWith('http') || artworkUrl.startsWith('blob:')
      ? artworkUrl
      : staticFile(artworkUrl.replace(/^\//, ''))
    : null;

  const isCircle = shape === 'circle';
  const isSquare = shape === 'square';

  // Dynamic user-customizable sizing
  const baseW = Math.max(280, Math.min(680, artworkWidth));
  const width = baseW;
  const height = isCircle ? baseW : (isSquare ? baseW : Math.round(baseW * 1.38));
  const borderRadius = isCircle ? '50%' : '24px';

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        transform: `perspective(1200px) translateY(${floatY}px) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer Atmospheric Glow Layer behind card */}
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius,
          background: `radial-gradient(circle at 50% 50%, ${accentColor} 0%, transparent 70%)`,
          filter: 'blur(35px)',
          opacity: 0.35 + 0.15 * Math.sin(t * 2 * Math.PI * 2),
          zIndex: 0,
        }}
      />

      {/* Main Artwork Card Body */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius,
          overflow: 'hidden',
          backgroundColor: '#111827',
          boxShadow: `
            0 25px 60px -15px rgba(0, 0, 0, 0.75),
            0 0 0 1.5px rgba(255, 255, 255, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.25)
          `,
          zIndex: 1,
        }}
      >
        {resolvedSrc ? (
          <Img
            src={resolvedSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          /* Elegant Default 3D Book Art when no image is uploaded */
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(145deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '36px 30px',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Book spine decorative crease */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '24px',
                width: '4px',
                background: 'linear-gradient(to right, rgba(0,0,0,0.5), rgba(255,255,255,0.2), rgba(0,0,0,0.5))',
              }}
            />

            {/* Top Ornamental Badge */}
            <div style={{ paddingLeft: '16px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#fbbf24',
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                AUDIO BOOK EDITION
              </span>
            </div>

            {/* Central Book Title on Artwork */}
            <div style={{ paddingLeft: '16px' }}>
              <h3
                style={{
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                  fontSize: '36px',
                  lineHeight: '1.25',
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '15px',
                  color: '#94a3b8',
                  fontWeight: 600,
                }}
              >
                {authorName}
              </p>
            </div>

            {/* Bottom Publisher Seal */}
            <div
              style={{
                paddingLeft: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(251, 191, 36, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  fontSize: '16px',
                }}
              >
                📖
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                High Definition Audio
              </span>
            </div>
          </div>
        )}

        {/* Diagonal Gloss Glass Sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
