import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetDhammaLotusProps {
  loopDurationFrames?: number;
}

export const PresetDhammaLotus: React.FC<PresetDhammaLotusProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. 8 Floating Sacred Golden Lotuses
  const lotuses = useMemo(() => {
    return [
      { id: 1, startX: 180, startY: 820, size: 70, speed: 1, phase: 0.2 },
      { id: 2, startX: 420, startY: 650, size: 55, speed: 2, phase: 1.1 },
      { id: 3, startX: 780, startY: 890, size: 85, speed: 1, phase: 2.3 },
      { id: 4, startX: 1100, startY: 740, size: 60, speed: 2, phase: 0.7 },
      { id: 5, startX: 1380, startY: 860, size: 75, speed: 1, phase: 1.8 },
      { id: 6, startX: 1680, startY: 690, size: 65, speed: 2, phase: 2.9 },
      { id: 7, startX: 920, startY: 960, size: 90, speed: 1, phase: 3.4 },
      { id: 8, startX: 1520, startY: 920, size: 50, speed: 2, phase: 0.5 },
    ];
  }, []);

  // 2. Rising Golden Aura Sparks (35 blessing particles)
  const auraSparks = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: (i * 79 + 30) % 1920,
      startY: (i * 43 + 20) % 1080,
      size: 4 + (i % 5) * 3,
      speed: 1 + (i % 3),
      phase: (i * 0.4) % (2 * Math.PI),
    }));
  }, []);

  // Rotating Sacred Aura Rays
  const rayAngle = t * 360 * 0.5; // Half rotation in 20s
  const rayPulse = 0.75 + 0.25 * Math.sin(t * 4 * Math.PI);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Central Sacred Aura Rays (God Rays) */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '15%',
          width: '70%',
          height: '140%',
          background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(234, 179, 8, 0.08) 20deg, transparent 40deg, rgba(234, 179, 8, 0.08) 60deg, transparent 80deg, rgba(234, 179, 8, 0.08) 100deg, transparent 120deg, rgba(234, 179, 8, 0.08) 140deg, transparent 160deg, rgba(234, 179, 8, 0.08) 180deg, transparent 200deg, rgba(234, 179, 8, 0.08) 220deg, transparent 240deg, rgba(234, 179, 8, 0.08) 260deg, transparent 280deg, rgba(234, 179, 8, 0.08) 300deg, transparent 320deg, rgba(234, 179, 8, 0.08) 340deg, transparent 360deg)',
          filter: 'blur(12px)',
          transform: `rotate(${rayAngle}deg)`,
          opacity: rayPulse,
          mixBlendMode: 'screen',
        }}
      />

      {/* Floating Stylized Golden Lotus Blossoms */}
      {lotuses.map((l) => {
        const floatY = Math.sin(t * 2 * Math.PI * l.speed + l.phase) * 28;
        const floatX = Math.cos(t * 2 * Math.PI * l.speed + l.phase) * 16;
        const rotZ = Math.sin(t * 2 * Math.PI + l.phase) * 12;
        const opacity = 0.55 + 0.25 * Math.sin(t * 2 * Math.PI * l.speed + l.phase);

        return (
          <div
            key={`lotus-${l.id}`}
            style={{
              position: 'absolute',
              left: `${l.startX + floatX - l.size / 2}px`,
              top: `${l.startY + floatY - l.size / 2}px`,
              width: `${l.size}px`,
              height: `${l.size * 0.8}px`,
              transform: `rotate(${rotZ}deg)`,
              opacity,
              filter: 'drop-shadow(0 0 14px rgba(234, 179, 8, 0.6))',
            }}
          >
            {/* Sacred Golden Lotus Blossom SVG */}
            <svg viewBox="0 0 100 80" width="100%" height="100%" fill="none">
              {/* Central Petal */}
              <path
                d="M50 5 C56 25, 68 45, 50 72 C32 45, 44 25, 50 5 Z"
                fill="url(#lotus-gold)"
              />
              {/* Left Main Petal */}
              <path
                d="M50 72 C30 65, 8 45, 20 22 C34 32, 45 52, 50 72 Z"
                fill="url(#lotus-gold-dark)"
                opacity="0.9"
              />
              {/* Right Main Petal */}
              <path
                d="M50 72 C70 65, 92 45, 80 22 C66 32, 55 52, 50 72 Z"
                fill="url(#lotus-gold-dark)"
                opacity="0.9"
              />
              {/* Outer Left Leaf */}
              <path
                d="M50 72 C22 68, 0 54, 5 36 C18 42, 35 58, 50 72 Z"
                fill="url(#lotus-gold)"
                opacity="0.75"
              />
              {/* Outer Right Leaf */}
              <path
                d="M50 72 C78 68, 100 54, 95 36 C82 42, 65 58, 50 72 Z"
                fill="url(#lotus-gold)"
                opacity="0.75"
              />
              {/* Lotus base pedestal line */}
              <ellipse cx="50" cy="74" rx="28" ry="4" fill="rgba(250, 204, 21, 0.8)" />
              <defs>
                <linearGradient id="lotus-gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                <linearGradient id="lotus-gold-dark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="60%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#713f12" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      })}

      {/* Rising Golden Aura Particles */}
      {auraSparks.map((s) => {
        const totalH = 1080 + s.size * 2;
        const curY = ((s.startY - t * totalH * s.speed) % totalH + totalH) % totalH - s.size;
        const wanderX = Math.sin(t * 2 * Math.PI * 2 + s.phase) * 25;
        const twinkle = Math.sin(t * 4 * Math.PI + s.phase);

        return (
          <div
            key={`spark-${s.id}`}
            style={{
              position: 'absolute',
              left: `${s.x + wanderX}px`,
              top: `${curY}px`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: '50%',
              background: '#fef08a',
              boxShadow: '0 0 10px #eab308',
              opacity: 0.35 + 0.45 * Math.abs(twinkle),
            }}
          />
        );
      })}
    </div>
  );
};
