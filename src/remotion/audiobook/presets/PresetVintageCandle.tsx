import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetVintageCandleProps {
  loopDurationFrames?: number;
}

export const PresetVintageCandle: React.FC<PresetVintageCandleProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Vintage Floating Dust Motes (40 particles)
  const dustMotes = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (i * 83 + 45) % 1920,
      baseY: (i * 53 + 25) % 1080,
      r: 2 + (i % 4) * 2, // 2px to 8px
      speedY: 1 + (i % 3),
      wanderAmp: 25 + (i % 4) * 10,
      phase: (i * 0.5) % (2 * Math.PI),
      color: i % 2 === 0 ? '#fde68a' : '#d97706',
    }));
  }, []);

  // 2. Candlelight Thermal Flicker Physics
  // Using multiple harmonic sines for realistic flame breathing
  const flicker =
    0.85 +
    0.10 * Math.sin(t * 2 * Math.PI * 8) +
    0.05 * Math.sin(t * 2 * Math.PI * 14) +
    0.03 * Math.cos(t * 2 * Math.PI * 22);

  const flameGlowX = 400 + Math.sin(t * 2 * Math.PI * 3) * 15;
  const flameGlowY = 480 + Math.cos(t * 2 * Math.PI * 2) * 12;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Layer 1: Ambient Candlelight Radial Lantern Glow */}
      <div
        style={{
          position: 'absolute',
          left: `${flameGlowX - 500}px`,
          top: `${flameGlowY - 500}px`,
          width: '1000px',
          height: '1000px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.15) 45%, transparent 75%)',
          filter: 'blur(50px)',
          opacity: flicker,
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 2: Floating Golden Dust Motes */}
      {dustMotes.map((m) => {
        const floatY = Math.sin(t * 2 * Math.PI * m.speedY + m.phase) * 35;
        const wanderX = Math.cos(t * 2 * Math.PI * m.speedY + m.phase) * m.wanderAmp;
        const moteGlow = 0.3 + 0.7 * Math.pow(Math.sin(t * 2 * Math.PI * 3 + m.phase), 2);

        return (
          <div
            key={`mote-${m.id}`}
            style={{
              position: 'absolute',
              left: `${m.x + wanderX}px`,
              top: `${m.baseY + floatY}px`,
              width: `${m.r * 2}px`,
              height: `${m.r * 2}px`,
              borderRadius: '50%',
              background: m.color,
              boxShadow: `0 0 8px ${m.color}`,
              opacity: moteGlow * flicker,
              filter: 'blur(0.5px)',
            }}
          />
        );
      })}

      {/* Layer 3: Vintage Vignette Shading */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(10, 5, 2, 0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
