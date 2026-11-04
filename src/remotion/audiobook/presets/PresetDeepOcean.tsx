import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetDeepOceanProps {
  loopDurationFrames?: number;
}

export const PresetDeepOcean: React.FC<PresetDeepOceanProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Bioluminescent Jelly Orbs
  const jellies = useMemo(() => {
    return [
      { id: 1, x: 220, y: 350, r: 55, color: '#06b6d4', speed: 1, phase: 0.1 },
      { id: 2, x: 500, y: 720, r: 85, color: '#2dd4bf', speed: 2, phase: 1.4 },
      { id: 3, x: 820, y: 240, r: 45, color: '#38bdf8', speed: 1, phase: 2.7 },
      { id: 4, x: 1180, y: 680, r: 95, color: '#10b981', speed: 1, phase: 0.8 },
      { id: 5, x: 1480, y: 310, r: 65, color: '#06b6d4', speed: 2, phase: 2.1 },
      { id: 6, x: 1750, y: 800, r: 75, color: '#2dd4bf', speed: 1, phase: 3.2 },
      { id: 7, x: 340, y: 920, r: 60, color: '#0284c7', speed: 2, phase: 1.8 },
      { id: 8, x: 980, y: 880, r: 70, color: '#06b6d4', speed: 1, phase: 0.5 },
      { id: 9, x: 1350, y: 180, r: 50, color: '#10b981', speed: 2, phase: 2.5 },
    ];
  }, []);

  // 2. Rising Micro Underwater Bubbles
  const bubbles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: (i * 73 + 28) % 1920,
      startY: (i * 49 + 15) % 1080,
      r: 3 + (i % 5) * 3, // 3px to 15px
      speed: 1 + (i % 3),
      wobbleFreq: 3 + (i % 4),
      phase: (i * 0.4) % (2 * Math.PI),
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Top Caustic Water Light Waves */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '240px',
          background: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 0%, rgba(2, 44, 53, 0.05) 60%, transparent 100%)',
          filter: 'blur(20px)',
          opacity: 0.7 + 0.3 * Math.sin(t * 4 * Math.PI),
        }}
      />

      {/* Bioluminescent Jelly Orbs */}
      {jellies.map((j) => {
        const floatY = Math.sin(t * 2 * Math.PI * j.speed + j.phase) * 35;
        const floatX = Math.cos(t * 2 * Math.PI * j.speed + j.phase) * 20;
        const pulse = 1 + 0.15 * Math.sin(t * 4 * Math.PI * j.speed + j.phase);
        const glowOpacity = 0.5 + 0.35 * Math.sin(t * 2 * Math.PI * j.speed + j.phase);

        return (
          <div
            key={`jelly-${j.id}`}
            style={{
              position: 'absolute',
              left: `${j.x + floatX - j.r}px`,
              top: `${j.y + floatY - j.r}px`,
              width: `${j.r * 2}px`,
              height: `${j.r * 2.2}px`,
              transform: `scale(${pulse})`,
              opacity: glowOpacity,
              mixBlendMode: 'screen',
            }}
          >
            {/* Outer soft aura */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50% 50% 45% 45%',
                background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.8) 0%, ${j.color} 50%, transparent 80%)`,
                filter: 'blur(8px)',
              }}
            />
            {/* Inner dome */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                right: '20%',
                height: '45%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                filter: 'blur(3px)',
              }}
            />
            {/* Flowing tentacles / filaments */}
            <div
              style={{
                position: 'absolute',
                bottom: '-15%',
                left: '25%',
                right: '25%',
                height: '40%',
                borderBottom: `2px solid ${j.color}`,
                borderLeft: `1.5px solid ${j.color}`,
                borderRight: `1.5px solid ${j.color}`,
                borderRadius: '0 0 50% 50%',
                opacity: 0.6,
                transform: `skewX(${Math.sin(t * 4 * Math.PI + j.phase) * 8}deg)`,
              }}
            />
          </div>
        );
      })}

      {/* Rising Micro Bubbles */}
      {bubbles.map((b) => {
        const totalH = 1080 + b.r * 2;
        const curY = ((b.startY - t * totalH * b.speed) % totalH + totalH) % totalH - b.r;
        const wobbleX = Math.sin(t * 2 * Math.PI * b.wobbleFreq + b.phase) * 18;

        return (
          <div
            key={`bubble-${b.id}`}
            style={{
              position: 'absolute',
              left: `${b.x + wobbleX}px`,
              top: `${curY}px`,
              width: `${b.r * 2}px`,
              height: `${b.r * 2}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(6, 182, 212, 0.4) 60%, transparent 100%)',
              border: '1px solid rgba(255,255,255,0.5)',
              opacity: 0.65,
              boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
            }}
          />
        );
      })}
    </div>
  );
};
