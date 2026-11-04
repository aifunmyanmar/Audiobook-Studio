import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetGoldenEmbersProps {
  loopDurationFrames?: number;
}

export const PresetGoldenEmbers: React.FC<PresetGoldenEmbersProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 45 golden embers & glowing dust motes across different depth layers
  const embers = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const startX = (i * 89 + 33) % 1920;
      const startY = (i * 59 + 17) % 1080;
      const isBigBokeh = i % 5 === 0;
      const size = isBigBokeh ? 40 + (i % 3) * 20 : 4 + (i % 6) * 3; // 4px to 80px
      const blur = isBigBokeh ? 8 + (i % 4) * 3 : (i % 2 === 0 ? 0.5 : 1.5);
      const speedY = 1 + (i % 4);
      const wanderAmp = isBigBokeh ? 30 : 50 + (i % 4) * 15;
      const wanderFreq = 1 + (i % 3);
      const twinkleFreq = 2 + (i % 5);
      const phase = (i * 0.45) % (2 * Math.PI);
      const color = i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#f59e0b' : '#fde047');
      return { id: i, startX, startY, isBigBokeh, size, blur, speedY, wanderAmp, wanderFreq, twinkleFreq, phase, color };
    });
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {embers.map((e) => {
        // Upward thermal draft across 1080p, wrapped seamlessly
        const totalTravelY = 1080 + e.size * 2;
        const curY = ((e.startY - t * totalTravelY * e.speedY) % totalTravelY + totalTravelY) % totalTravelY - e.size;

        // Smooth horizontal wandering
        const curX = e.startX + Math.sin(t * 2 * Math.PI * e.wanderFreq + e.phase) * e.wanderAmp;

        // Twinkle / thermal brightness pulsation
        const twinkle = Math.pow(Math.sin(t * 2 * Math.PI * e.twinkleFreq + e.phase), 2);
        const opacity = e.isBigBokeh
          ? 0.15 + 0.12 * twinkle
          : 0.35 + 0.65 * twinkle;

        const scale = 0.8 + 0.4 * twinkle;

        return (
          <div
            key={e.id}
            style={{
              position: 'absolute',
              left: `${curX}px`,
              top: `${curY}px`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              borderRadius: '50%',
              background: e.isBigBokeh
                ? `radial-gradient(circle, ${e.color} 0%, rgba(245, 158, 11, 0.4) 50%, transparent 80%)`
                : `radial-gradient(circle, #ffffff 0%, ${e.color} 40%, rgba(245, 158, 11, 0.6) 80%, transparent 100%)`,
              filter: `blur(${e.blur}px)`,
              opacity,
              transform: `scale(${scale})`,
              boxShadow: e.isBigBokeh ? 'none' : `0 0 ${e.size * 2}px ${e.color}`,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </div>
  );
};
