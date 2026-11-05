import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetRainyGlassProps {
  loopDurationFrames?: number;
}

export const PresetRainyGlass: React.FC<PresetRainyGlassProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Vertical background rain streaks (fast falling parallax)
  const rainStreaks = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: (i * 65 + 15) % 1920,
      startY: (i * 37) % 1080,
      len: 80 + (i % 5) * 25,
      speed: 2 + (i % 3),
      opacity: 0.12 + (i % 4) * 0.05,
    }));
  }, []);

  // 2. Condensed raindrops on the glass surface
  const glassDrops = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const x = (i * 97 + 40) % 1860 + 30;
      const y = (i * 61 + 25) % 980 + 30;
      const r = 8 + (i % 6) * 4; // 8px to 32px
      const dripSpeed = i % 4 === 0 ? 1 : 0; // Some drops drip slowly
      const dripDistance = 40 + (i % 3) * 20;
      const phase = (i * 0.5) % (2 * Math.PI);
      return { id: i, x, y, r, dripSpeed, dripDistance, phase };
    });
  }, []);

  // 3. Subtle bottom puddle ripples
  const ripples = useMemo(() => {
    return [
      { id: 1, x: 420, y: 1010, maxR: 120, speed: 2, phase: 0 },
      { id: 2, x: 1100, y: 1030, maxR: 150, speed: 2, phase: 0.4 },
      { id: 3, x: 1580, y: 990, maxR: 100, speed: 2, phase: 0.7 },
    ];
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Layer 1: Background Fast Rain Streaks */}
      {rainStreaks.map((s) => {
        const totalH = 1080 + s.len * 2;
        const curY = ((s.startY + t * totalH * s.speed * 3) % totalH) - s.len;
        return (
          <div
            key={`streak-${s.id}`}
            style={{
              position: 'absolute',
              left: `${s.x}px`,
              top: `${curY}px`,
              width: '1.5px',
              height: `${s.len}px`,
              background: 'linear-gradient(to bottom, transparent, rgba(186, 230, 253, 0.4) 60%, rgba(255, 255, 255, 0.6) 100%)',
              opacity: s.opacity,
              transform: 'rotate(-4deg)',
            }}
          />
        );
      })}

      {/* Layer 2: Glass Surface Raindrops with Specular Highlights */}
      {glassDrops.map((d) => {
        const dripOffset = d.dripSpeed > 0 ? Math.sin(t * 2 * Math.PI * d.dripSpeed + d.phase) * d.dripDistance : 0;
        const curY = d.y + dripOffset;
        const wobbleX = Math.sin(t * 4 * Math.PI + d.phase) * 1.5;

        return (
          <div
            key={`drop-${d.id}`}
            style={{
              position: 'absolute',
              left: `${d.x + wobbleX}px`,
              top: `${curY}px`,
              width: `${d.r * 1.5}px`,
              height: `${d.r * 2}px`,
              borderRadius: '50% 50% 60% 60%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7) 0%, rgba(56, 189, 248, 0.25) 45%, rgba(15, 23, 42, 0.4) 100%)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 3px 6px rgba(0,0,0,0.5)',
              opacity: 0.75,
              filter: 'blur(0.4px)',
            }}
          >
            {/* Tiny highlight glint */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '30%',
                height: '25%',
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.85,
              }}
            />
          </div>
        );
      })}

      {/* Layer 3: Expanding Water Ripples */}
      {ripples.map((rip) => {
        const ripProgress = (t * rip.speed + rip.phase) % 1;
        const radius = ripProgress * rip.maxR;
        const opacity = Math.sin(ripProgress * Math.PI) * 0.4;
        return (
          <div
            key={`rip-${rip.id}`}
            style={{
              position: 'absolute',
              left: `${rip.x - radius}px`,
              top: `${rip.y - radius * 0.35}px`,
              width: `${radius * 2}px`,
              height: `${radius * 0.7}px`,
              borderRadius: '50%',
              border: '1.5px solid rgba(186, 230, 253, 0.5)',
              opacity,
              transform: 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
};
