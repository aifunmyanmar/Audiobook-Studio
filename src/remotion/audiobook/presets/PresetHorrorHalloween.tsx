import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetHorrorHalloweenProps {
  loopDurationFrames?: number;
}

export const PresetHorrorHalloween: React.FC<PresetHorrorHalloweenProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Spooky Blood Moon Ambient Pulsation
  const moonPulse = 0.85 + 0.15 * Math.sin(t * 2 * Math.PI * 2);

  // 2. Ghostly Eerie Embers & Ashes (35 rising embers)
  const embers = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: (i * 83 + 27) % 1920,
      startY: (i * 47 + 19) % 1080,
      size: 3 + (i % 5) * 2.5,
      speedY: 1 + (i % 3),
      wobbleFreq: 2 + (i % 3),
      phase: (i * 0.45) % (2 * Math.PI),
      color: i % 2 === 0 ? '#ef4444' : '#f97316',
    }));
  }, []);

  // 3. Spooky Bat Silhouettes (5 flying across in seamless trajectory)
  const bats = useMemo(() => {
    return [
      { id: 1, startX: 200, startY: 180, scale: 0.7, speed: 1, phase: 0 },
      { id: 2, startX: 750, startY: 120, scale: 0.5, speed: 2, phase: 1.2 },
      { id: 3, startX: 1300, startY: 220, scale: 0.8, speed: 1, phase: 2.5 },
      { id: 4, startX: 1680, startY: 150, scale: 0.6, speed: 2, phase: 0.7 },
    ];
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Ominous Blood Moon Glow in Top-Right Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.45) 0%, rgba(185, 28, 28, 0.20) 45%, transparent 75%)',
          filter: 'blur(45px)',
          opacity: moonPulse,
          mixBlendMode: 'screen',
        }}
      />

      {/* Layered Ground Cemetery Spooky Fog Banks */}
      {[0, 1].map((fIdx) => {
        const driftX = Math.sin(t * 2 * Math.PI * (fIdx === 0 ? 1 : -1) + fIdx) * 90;
        const opacity = 0.25 + 0.10 * Math.cos(t * 2 * Math.PI * 2 + fIdx);
        return (
          <div
            key={`fog-${fIdx}`}
            style={{
              position: 'absolute',
              bottom: fIdx * 80,
              left: '-20%',
              width: '140%',
              height: '380px',
              background: 'radial-gradient(ellipse at 50% 60%, rgba(220, 38, 38, 0.2) 0%, rgba(69, 10, 10, 0.15) 50%, transparent 80%)',
              filter: 'blur(50px)',
              transform: `translateX(${driftX}px)`,
              opacity,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}

      {/* Rising Blood-Red Ghostly Embers */}
      {embers.map((e) => {
        const totalH = 1080 + e.size * 2;
        const curY = ((e.startY - t * totalH * e.speedY) % totalH + totalH) % totalH - e.size;
        const wanderX = Math.sin(t * 2 * Math.PI * e.wobbleFreq + e.phase) * 35;
        const glow = Math.sin(t * 4 * Math.PI + e.phase);

        return (
          <div
            key={`ember-${e.id}`}
            style={{
              position: 'absolute',
              left: `${e.x + wanderX}px`,
              top: `${curY}px`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              borderRadius: '50%',
              background: e.color,
              boxShadow: `0 0 10px ${e.color}`,
              opacity: 0.3 + 0.6 * Math.abs(glow),
            }}
          />
        );
      })}

      {/* Distant Spooky Bat Silhouettes Fluttering */}
      {bats.map((b) => {
        const flap = Math.sin(t * 2 * Math.PI * 12 + b.phase) * 20; // 12 wing flaps per loop
        const batX = b.startX + Math.sin(t * 2 * Math.PI * b.speed + b.phase) * 60;
        const batY = b.startY + Math.cos(t * 2 * Math.PI * b.speed + b.phase) * 25;

        return (
          <div
            key={`bat-${b.id}`}
            style={{
              position: 'absolute',
              left: `${batX}px`,
              top: `${batY}px`,
              transform: `scale(${b.scale})`,
              opacity: 0.45,
            }}
          >
            {/* Minimalist Bat Silhouette SVG */}
            <svg viewBox="0 0 60 30" width="60" height="30" fill="#1c0507">
              <path
                d={`M30 15 C20 ${10 + flap * 0.3}, 10 ${5 - flap * 0.5}, 0 ${12 + flap * 0.4} C8 22, 18 18, 25 24 C28 20, 32 20, 35 24 C42 18, 52 22, 60 ${12 + flap * 0.4} C50 ${5 - flap * 0.5}, 40 ${10 + flap * 0.3}, 30 15 Z`}
                filter="drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
