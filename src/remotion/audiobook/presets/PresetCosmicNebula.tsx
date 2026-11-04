import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetCosmicNebulaProps {
  loopDurationFrames?: number;
}

export const PresetCosmicNebula: React.FC<PresetCosmicNebulaProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 1. Twinkling Stars (55 stars across deep space)
  const stars = useMemo(() => {
    return Array.from({ length: 55 }).map((_, i) => {
      const x = (i * 71 + 35) % 1920;
      const y = (i * 47 + 19) % 1080;
      const isCrossStar = i % 6 === 0;
      const size = isCrossStar ? 16 + (i % 4) * 6 : 2 + (i % 4) * 2;
      const freq = 1 + (i % 4);
      const phase = (i * 0.45) % (2 * Math.PI);
      const color = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#c084fc' : '#38bdf8');
      return { id: i, x, y, isCrossStar, size, freq, phase, color };
    });
  }, []);

  // 2. Cosmic Nebula Gas Clouds
  const nebulae = useMemo(() => {
    return [
      { id: 1, cx: 450, cy: 300, r: 350, c1: 'rgba(147, 51, 234, 0.22)', c2: 'rgba(236, 72, 153, 0.12)', rotSpeed: 1 },
      { id: 2, cx: 1450, cy: 650, r: 420, c1: 'rgba(59, 130, 246, 0.20)', c2: 'rgba(168, 85, 247, 0.15)', rotSpeed: -1 },
      { id: 3, cx: 960, cy: 900, r: 300, c1: 'rgba(236, 72, 153, 0.15)', c2: 'rgba(99, 102, 241, 0.10)', rotSpeed: 1 },
    ];
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Layer 1: Rotating Cosmic Nebula Clouds */}
      {nebulae.map((n) => {
        const rot = t * 360 * n.rotSpeed;
        const pulse = 1 + 0.08 * Math.sin(t * 2 * Math.PI);

        return (
          <div
            key={`neb-${n.id}`}
            style={{
              position: 'absolute',
              left: `${n.cx - n.r}px`,
              top: `${n.cy - n.r}px`,
              width: `${n.r * 2}px`,
              height: `${n.r * 2}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle at 45% 45%, ${n.c1} 0%, ${n.c2} 55%, transparent 75%)`,
              filter: 'blur(45px)',
              transform: `rotate(${rot}deg) scale(${pulse})`,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}

      {/* Layer 2: 55 Twinkling Stars & Cross-Stars */}
      {stars.map((s) => {
        const twinkle = Math.pow(Math.sin(t * 2 * Math.PI * s.freq + s.phase), 2);
        const opacity = 0.2 + 0.8 * twinkle;
        const scale = 0.7 + 0.5 * twinkle;

        if (s.isCrossStar) {
          return (
            <div
              key={`star-${s.id}`}
              style={{
                position: 'absolute',
                left: `${s.x - s.size / 2}px`,
                top: `${s.y - s.size / 2}px`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              {/* 4-point sparkle star SVG */}
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill={s.color}>
                <polygon points="12,0 14,9 24,12 14,15 12,24 10,15 0,12 10,9" />
              </svg>
            </div>
          );
        }

        return (
          <div
            key={`star-${s.id}`}
            style={{
              position: 'absolute',
              left: `${s.x}px`,
              top: `${s.y}px`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: '50%',
              background: s.color,
              opacity,
              transform: `scale(${scale})`,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            }}
          />
        );
      })}

      {/* Layer 3: Seamless Looping Shooting Star Trail */}
      {(() => {
        const shootT = (t * 2) % 1; // triggers twice per 20s
        const shootX = 1800 - shootT * 1200;
        const shootY = 80 + shootT * 500;
        const shootOpacity = Math.sin(shootT * Math.PI) * 0.75;
        return (
          <div
            style={{
              position: 'absolute',
              left: `${shootX}px`,
              top: `${shootY}px`,
              width: '160px',
              height: '2px',
              background: 'linear-gradient(to left, #ffffff, rgba(192, 132, 252, 0.7) 40%, transparent 100%)',
              transform: 'rotate(-28deg)',
              opacity: shootOpacity,
              filter: 'blur(0.5px)',
            }}
          />
        );
      })()}
    </div>
  );
};
