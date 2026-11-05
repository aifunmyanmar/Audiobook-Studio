import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetMotivationRaysProps {
  loopDurationFrames?: number;
}

export const PresetMotivationRays: React.FC<PresetMotivationRaysProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Shimmering Glory Bokeh & Ascending Success Sparkles (40 motes)
  const motes = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (i * 87 + 39) % 1920,
      startY: (i * 51 + 23) % 1080,
      size: 4 + (i % 6) * 3,
      speedY: 1 + (i % 3),
      wobbleFreq: 2 + (i % 4),
      phase: (i * 0.4) % (2 * Math.PI),
      color: i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#f59e0b' : '#ffffff'),
    }));
  }, []);

  // Ray rotation and breathing pulse
  const rayAngle = Math.sin(t * 2 * Math.PI) * 12;
  const rayPulse = 0.8 + 0.2 * Math.sin(t * 4 * Math.PI);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Top Center Radiant Sun Origin Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-180px',
          left: '30%',
          width: '40%',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 20%, rgba(254, 240, 138, 0.45) 0%, rgba(245, 158, 11, 0.20) 45%, transparent 75%)',
          filter: 'blur(40px)',
          opacity: rayPulse,
          mixBlendMode: 'screen',
        }}
      />

      {/* Volumetric Fan God Rays (Conic Angular Beams) */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '10%',
          width: '80%',
          height: '160%',
          background: 'conic-gradient(from 70deg at 50% 0%, transparent 0deg, rgba(251, 191, 36, 0.12) 15deg, transparent 30deg, rgba(251, 191, 36, 0.14) 45deg, transparent 60deg, rgba(251, 191, 36, 0.12) 75deg, transparent 90deg, rgba(251, 191, 36, 0.14) 105deg, transparent 120deg, rgba(251, 191, 36, 0.12) 135deg, transparent 150deg)',
          filter: 'blur(16px)',
          transform: `rotate(${rayAngle}deg)`,
          opacity: rayPulse,
          mixBlendMode: 'screen',
        }}
      />

      {/* Ascending Golden Motivation Sparkles */}
      {motes.map((m) => {
        const totalH = 1080 + m.size * 2;
        const curY = ((m.startY - t * totalH * m.speedY) % totalH + totalH) % totalH - m.size;
        const wanderX = Math.sin(t * 2 * Math.PI * m.wobbleFreq + m.phase) * 30;
        const shimmer = Math.sin(t * 4 * Math.PI + m.phase);

        return (
          <div
            key={`mote-${m.id}`}
            style={{
              position: 'absolute',
              left: `${m.x + wanderX}px`,
              top: `${curY}px`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              borderRadius: '50%',
              background: m.color,
              boxShadow: `0 0 12px ${m.color}`,
              opacity: 0.35 + 0.55 * Math.abs(shimmer),
            }}
          />
        );
      })}
    </div>
  );
};
