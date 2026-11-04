import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetMysticFogProps {
  loopDurationFrames?: number;
}

export const PresetMysticFog: React.FC<PresetMysticFogProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. 16 Glowing Fireflies with Organic Flight Paths
  const fireflies = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      baseX: (i * 115 + 60) % 1860 + 30,
      baseY: (i * 71 + 40) % 1000 + 40,
      r: 4 + (i % 4) * 2, // 4px to 10px
      freqX: 1 + (i % 3),
      freqY: 2 + (i % 2),
      ampX: 50 + (i % 4) * 20,
      ampY: 40 + (i % 3) * 15,
      pulseFreq: 3 + (i % 4),
      phase: (i * 0.6) % (2 * Math.PI),
      color: i % 2 === 0 ? '#4ade80' : '#a3e635',
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Layer 1: Ambient Lower Ground Fog */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '420px',
          background: 'linear-gradient(to top, rgba(6, 78, 59, 0.35) 0%, rgba(5, 46, 38, 0.15) 50%, transparent 100%)',
          filter: 'blur(30px)',
          opacity: 0.8 + 0.2 * Math.sin(t * 2 * Math.PI),
        }}
      />

      {/* Layer 2: Moving Volumetric Mist Banks (Parallax X) */}
      {[0, 1, 2].map((layerIdx) => {
        const speed = layerIdx === 0 ? 1 : (layerIdx === 1 ? -1 : 2);
        const shiftX = Math.sin(t * 2 * Math.PI * speed) * 80;
        const opacity = 0.18 + layerIdx * 0.08 + 0.05 * Math.cos(t * 2 * Math.PI);
        const topPos = 200 + layerIdx * 250;

        return (
          <div
            key={`mist-${layerIdx}`}
            style={{
              position: 'absolute',
              left: `-20%`,
              width: '140%',
              top: `${topPos}px`,
              height: '280px',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.16) 0%, rgba(6, 95, 70, 0.08) 50%, transparent 80%)',
              filter: 'blur(40px)',
              transform: `translateX(${shiftX}px)`,
              opacity,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}

      {/* Layer 3: Glowing Emerald & Lime Fireflies */}
      {fireflies.map((f) => {
        const curX = f.baseX + Math.sin(t * 2 * Math.PI * f.freqX + f.phase) * f.ampX;
        const curY = f.baseY + Math.cos(t * 2 * Math.PI * f.freqY + f.phase) * f.ampY;
        const pulse = Math.pow(Math.sin(t * 2 * Math.PI * f.pulseFreq + f.phase), 2);
        const opacity = 0.15 + 0.85 * pulse;
        const glowSize = f.r * (3 + pulse * 4);

        return (
          <div
            key={`fly-${f.id}`}
            style={{
              position: 'absolute',
              left: `${curX - f.r}px`,
              top: `${curY - f.r}px`,
              width: `${f.r * 2}px`,
              height: `${f.r * 2}px`,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: `0 0 ${glowSize}px ${f.color}, 0 0 ${glowSize * 2}px ${f.color}`,
              opacity,
              transform: `scale(${0.8 + 0.4 * pulse})`,
            }}
          />
        );
      })}
    </div>
  );
};
