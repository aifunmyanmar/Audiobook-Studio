import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetAuroraWavesProps {
  loopDurationFrames?: number;
}

export const PresetAuroraWaves: React.FC<PresetAuroraWavesProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Grid of pulsating digital dots
  const gridDots = useMemo(() => {
    const dots: Array<{ x: number; y: number; delay: number }> = [];
    for (let x = 80; x < 1920; x += 140) {
      for (let y = 80; y < 1080; y += 140) {
        dots.push({ x, y, delay: (x + y) * 0.001 });
      }
    }
    return dots;
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Background Matrix of Soft Pulse Dots */}
      {gridDots.map((d, idx) => {
        const dotPulse = Math.sin(t * 2 * Math.PI * 2 + d.delay * 2 * Math.PI);
        return (
          <div
            key={`dot-${idx}`}
            style={{
              position: 'absolute',
              left: `${d.x}px`,
              top: `${d.y}px`,
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: '#00f5d4',
              opacity: 0.10 + 0.15 * Math.abs(dotPulse),
            }}
          />
        );
      })}

      {/* 4 Layered Harmonic Aurora Ribbons (SVG Wave Paths) */}
      {[0, 1, 2, 3].map((ribbonIdx) => {
        const baseY = 750 + ribbonIdx * 65;
        const color =
          ribbonIdx === 0
            ? '#00f5d4'
            : ribbonIdx === 1
            ? '#7b2cbf'
            : ribbonIdx === 2
            ? '#38bdf8'
            : '#ec4899';
        const speed = ribbonIdx % 2 === 0 ? 1 : -1;
        const phase = ribbonIdx * 1.2;

        // Generate smooth wave points across 1920 width
        const points: string[] = [];
        const segments = 12;
        const segWidth = 1920 / segments;

        for (let i = 0; i <= segments; i++) {
          const px = i * segWidth;
          const py =
            baseY +
            Math.sin(t * 2 * Math.PI * speed + (i / segments) * 2 * Math.PI * 2 + phase) * 60 +
            Math.cos(t * 4 * Math.PI + i * 0.5) * 20;
          points.push(`${i === 0 ? 'M' : 'L'} ${px},${py}`);
        }

        // Close path to bottom
        const pathData = `${points.join(' ')} L 1920,1080 L 0,1080 Z`;

        return (
          <svg
            key={`aurora-${ribbonIdx}`}
            viewBox="0 0 1920 1080"
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              inset: 0,
              filter: `blur(${ribbonIdx * 6 + 4}px)`,
              opacity: 0.25 - ribbonIdx * 0.04,
              mixBlendMode: 'screen',
            }}
          >
            <path d={pathData} fill={`url(#aurora-grad-${ribbonIdx})`} />
            <defs>
              <linearGradient id={`aurora-grad-${ribbonIdx}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="50%" stopColor="#00f5d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7b2cbf" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        );
      })}
    </div>
  );
};
