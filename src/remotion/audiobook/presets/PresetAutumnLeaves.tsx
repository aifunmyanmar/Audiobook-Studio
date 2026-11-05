import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetAutumnLeavesProps {
  loopDurationFrames?: number;
}

export const PresetAutumnLeaves: React.FC<PresetAutumnLeavesProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 26 meticulously parameterized autumn leaves and flower petals
  const leaves = useMemo(() => {
    return Array.from({ length: 26 }).map((_, i) => {
      const type = i % 2 === 0 ? 'leaf' : 'petal';
      const startX = (i * 77 + 45) % 1920;
      const startY = (i * 47 + 10) % 1080;
      const size = 26 + (i % 5) * 8; // 26px to 58px
      const color1 = i % 3 === 0 ? '#f97316' : (i % 3 === 1 ? '#e11d48' : '#eab308');
      const color2 = i % 3 === 0 ? '#b91c1c' : (i % 3 === 1 ? '#9f1239' : '#ca8a04');
      const windSpeed = 1 + (i % 3);
      const wobbleFreq = 2 + (i % 4);
      const phase = (i * 0.4) % (2 * Math.PI);
      return { id: i, type, startX, startY, size, color1, color2, windSpeed, wobbleFreq, phase };
    });
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {leaves.map((l) => {
        // Vertical descent across 1080p, wrapped seamlessly
        const totalTravelY = 1080 + l.size * 2;
        const curY = ((l.startY + t * totalTravelY * l.windSpeed) % totalTravelY) - l.size;

        // Graceful wind sway in X axis
        const curX = l.startX + Math.sin(t * 2 * Math.PI * l.wobbleFreq + l.phase) * (40 + l.windSpeed * 15);

        // 3D tumbling orientation
        const rotZ = Math.sin(t * 2 * Math.PI * l.windSpeed + l.phase) * 60 + l.phase * 30;
        const rotX = Math.cos(t * 2 * Math.PI * l.wobbleFreq + l.phase) * 55;
        const rotY = Math.sin(t * 2 * Math.PI * (l.windSpeed + 1) + l.phase) * 45;
        const opacity = 0.45 + 0.35 * Math.sin(t * 2 * Math.PI * l.windSpeed + l.phase);

        return (
          <div
            key={l.id}
            style={{
              position: 'absolute',
              left: `${curX}px`,
              top: `${curY}px`,
              width: `${l.size}px`,
              height: `${l.size * 1.3}px`,
              transform: `perspective(600px) rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              opacity,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
            }}
          >
            {l.type === 'leaf' ? (
              // Stylized Maple / Banyan Leaf SVG
              <svg viewBox="0 0 40 52" width="100%" height="100%" fill="none">
                <path
                  d="M20 2 C25 15, 38 18, 38 32 C38 44, 26 50, 20 50 C14 50, 2 44, 2 32 C2 18, 15 15, 20 2 Z"
                  fill={`url(#leaf-grad-${l.id})`}
                />
                {/* Central leaf vein */}
                <path d="M20 8 L20 46" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M20 20 L28 15" stroke="rgba(255,255,255,0.25)" strokeWidth="0.9" />
                <path d="M20 28 L12 23" stroke="rgba(255,255,255,0.25)" strokeWidth="0.9" />
                <path d="M20 36 L27 32" stroke="rgba(255,255,255,0.25)" strokeWidth="0.9" />
                <defs>
                  <linearGradient id={`leaf-grad-${l.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={l.color1} />
                    <stop offset="100%" stopColor={l.color2} />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              // Stylized Rose / Flower Petal SVG
              <svg viewBox="0 0 36 44" width="100%" height="100%" fill="none">
                <path
                  d="M18 2 C28 2, 34 16, 34 28 C34 38, 26 42, 18 42 C10 42, 2 38, 2 28 C2 16, 8 2, 18 2 Z"
                  fill={`url(#petal-grad-${l.id})`}
                />
                <defs>
                  <radialGradient id={`petal-grad-${l.id}`} cx="40%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fff1f2" stopOpacity="0.8" />
                    <stop offset="40%" stopColor={l.color1} />
                    <stop offset="100%" stopColor={l.color2} />
                  </radialGradient>
                </defs>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
