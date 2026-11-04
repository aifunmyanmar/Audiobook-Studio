import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface PresetFloatingBubblesProps {
  loopDurationFrames?: number;
}

export const PresetFloatingBubbles: React.FC<PresetFloatingBubblesProps> = ({
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // 24 meticulously parameterized glowing orbs
  const bubbles = useMemo(() => {
    return [
      { id: 1, x: 150, y: 220, r: 80, c1: '#c084fc', c2: '#6366f1', speedX: 1, speedY: 1, ampX: 45, ampY: 35, pX: 0.2, pY: 0.5, blur: 2 },
      { id: 2, x: 380, y: 780, r: 140, c1: '#38bdf8', c2: '#818cf8', speedX: 2, speedY: 1, ampX: 55, ampY: 60, pX: 1.1, pY: 0.8, blur: 4 },
      { id: 3, x: 620, y: 340, r: 50, c1: '#f472b6', c2: '#c084fc', speedX: 1, speedY: 2, ampX: 30, ampY: 45, pX: 2.3, pY: 1.4, blur: 1 },
      { id: 4, x: 880, y: 860, r: 110, c1: '#818cf8', c2: '#38bdf8', speedX: 1, speedY: 1, ampX: 40, ampY: 50, pX: 0.7, pY: 3.1, blur: 3 },
      { id: 5, x: 1150, y: 190, r: 95, c1: '#c084fc', c2: '#ec4899', speedX: 2, speedY: 2, ampX: 50, ampY: 40, pX: 1.9, pY: 2.0, blur: 2 },
      { id: 6, x: 1420, y: 640, r: 170, c1: '#38bdf8', c2: '#6366f1', speedX: 1, speedY: 1, ampX: 65, ampY: 70, pX: 3.4, pY: 0.3, blur: 5 },
      { id: 7, x: 1720, y: 310, r: 75, c1: '#ec4899', c2: '#f43f5e', speedX: 2, speedY: 1, ampX: 35, ampY: 45, pX: 0.5, pY: 2.7, blur: 2 },
      { id: 8, x: 1800, y: 890, r: 125, c1: '#a855f7', c2: '#3b82f6', speedX: 1, speedY: 2, ampX: 50, ampY: 55, pX: 1.6, pY: 1.8, blur: 3 },
      { id: 9, x: 260, y: 480, r: 60, c1: '#38bdf8', c2: '#2dd4bf', speedX: 2, speedY: 1, ampX: 35, ampY: 30, pX: 2.8, pY: 0.9, blur: 1 },
      { id: 10, x: 740, y: 120, r: 130, c1: '#c084fc', c2: '#818cf8', speedX: 1, speedY: 1, ampX: 60, ampY: 40, pX: 0.4, pY: 1.2, blur: 4 },
      { id: 11, x: 990, y: 520, r: 45, c1: '#f472b6', c2: '#fb7185', speedX: 2, speedY: 2, ampX: 25, ampY: 35, pX: 3.1, pY: 2.4, blur: 1 },
      { id: 12, x: 1290, y: 920, r: 155, c1: '#6366f1', c2: '#a855f7', speedX: 1, speedY: 1, ampX: 55, ampY: 65, pX: 1.0, pY: 0.4, blur: 4 },
      { id: 13, x: 1610, y: 150, r: 105, c1: '#38bdf8', c2: '#818cf8', speedX: 2, speedY: 1, ampX: 45, ampY: 50, pX: 2.5, pY: 3.0, blur: 3 },
      { id: 14, x: 90, y: 910, r: 120, c1: '#a855f7', c2: '#ec4899', speedX: 1, speedY: 2, ampX: 40, ampY: 60, pX: 0.9, pY: 1.5, blur: 3 },
      { id: 15, x: 500, y: 990, r: 70, c1: '#38bdf8', c2: '#6366f1', speedX: 2, speedY: 1, ampX: 30, ampY: 40, pX: 1.7, pY: 0.6, blur: 2 },
      { id: 16, x: 810, y: 690, r: 85, c1: '#c084fc', c2: '#38bdf8', speedX: 1, speedY: 1, ampX: 50, ampY: 45, pX: 2.9, pY: 2.1, blur: 2 },
      { id: 17, x: 1080, y: 790, r: 65, c1: '#ec4899', c2: '#f43f5e', speedX: 2, speedY: 2, ampX: 35, ampY: 30, pX: 0.3, pY: 1.9, blur: 1 },
      { id: 18, x: 1510, y: 440, r: 115, c1: '#818cf8', c2: '#38bdf8', speedX: 1, speedY: 1, ampX: 45, ampY: 55, pX: 2.0, pY: 0.7, blur: 3 },
      { id: 19, x: 1840, y: 560, r: 55, c1: '#c084fc', c2: '#6366f1', speedX: 2, speedY: 1, ampX: 25, ampY: 35, pX: 1.4, pY: 3.3, blur: 1 },
      { id: 20, x: 320, y: 110, r: 90, c1: '#f472b6', c2: '#a855f7', speedX: 1, speedY: 2, ampX: 40, ampY: 45, pX: 0.8, pY: 1.1, blur: 2 },
      { id: 21, x: 1220, y: 410, r: 50, c1: '#38bdf8', c2: '#2dd4bf', speedX: 2, speedY: 2, ampX: 30, ampY: 30, pX: 3.3, pY: 2.6, blur: 1 },
      { id: 22, x: 1680, y: 730, r: 95, c1: '#a855f7', c2: '#ec4899', speedX: 1, speedY: 1, ampX: 40, ampY: 50, pX: 1.2, pY: 0.5, blur: 2 },
      { id: 23, x: 440, y: 410, r: 135, c1: '#6366f1', c2: '#38bdf8', speedX: 1, speedY: 1, ampX: 60, ampY: 50, pX: 2.1, pY: 1.7, blur: 4 },
      { id: 24, x: 930, y: 310, r: 75, c1: '#c084fc', c2: '#f472b6', speedX: 2, speedY: 1, ampX: 35, ampY: 40, pX: 0.6, pY: 2.9, blur: 2 },
    ];
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {bubbles.map((b) => {
        // Pure sinusoidal periodic trajectory (Strictly 100% seamless at t=0 and t=1)
        const angleX = t * 2 * Math.PI * b.speedX + b.pX;
        const angleY = t * 2 * Math.PI * b.speedY + b.pY;
        const curX = b.x + Math.sin(angleX) * b.ampX;
        const curY = b.y + Math.cos(angleY) * b.ampY;
        const pulse = 1 + 0.12 * Math.sin(t * 4 * Math.PI + b.pX);
        const opacity = 0.28 + 0.18 * Math.sin(t * 2 * Math.PI * b.speedX + b.pY);

        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${curX - b.r}px`,
              top: `${curY - b.r}px`,
              width: `${b.r * 2}px`,
              height: `${b.r * 2}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, ${b.c1} 40%, ${b.c2} 75%, transparent 100%)`,
              filter: `blur(${b.blur}px)`,
              opacity,
              transform: `scale(${pulse})`,
              boxShadow: `0 0 ${b.r * 0.6}px ${b.c1}`,
              mixBlendMode: 'screen',
            }}
          >
            {/* Inner specular crescent reflection for realistic glass bubble effect */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: '35%',
                height: '25%',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.75)',
                transform: 'rotate(-25deg)',
                filter: 'blur(1px)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
