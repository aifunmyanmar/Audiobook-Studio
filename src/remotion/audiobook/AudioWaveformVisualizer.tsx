import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface AudioWaveformVisualizerProps {
  accentColor?: string;
  secondaryColor?: string;
  barCount?: number;
  loopDurationFrames?: number;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  accentColor = '#a855f7',
  secondaryColor = '#38bdf8',
  barCount = 56,
  loopDurationFrames = 600,
}) => {
  const frame = useCurrentFrame();
  const t = (frame % loopDurationFrames) / loopDurationFrames;

  // Pre-calculate harmonic integer cycles ensuring f(0) === f(600) with zero loop jump
  const barConfigs = useMemo(() => {
    return Array.from({ length: barCount }).map((_, i) => {
      // Gentle bell curve multiplier across bars for an aesthetic equalizer flow
      const centerFactor = 0.55 + Math.sin((i / barCount) * Math.PI) * 0.45;
      const cycles1 = 6 + (i % 8) * 2;
      const cycles2 = 12 + (i % 10) * 2;
      const phase = (i * 0.3) % (2 * Math.PI);
      return { id: i, centerFactor, cycles1, cycles2, phase };
    });
  }, [barCount]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '720px',
        height: '64px',
        padding: '10px 24px',
        borderRadius: '20px',
        background: 'rgba(15, 23, 42, 0.88)',
        border: '1.5px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Waveform Equalizer Bars - Spans wide across container */}
      {barConfigs.map((b) => {
        // Multi-frequency harmonic wave with integer cycles guarantees seamless loop
        const rawWave =
          Math.sin(t * 2 * Math.PI * b.cycles1 + b.phase) * 0.58 +
          Math.cos(t * 2 * Math.PI * b.cycles2 + b.phase * 1.4) * 0.42;
        const normalized = (rawWave + 1) / 2; // 0 to 1
        const heightPx = Math.max(5, Math.floor(normalized * 44 * b.centerFactor));

        return (
          <div
            key={b.id}
            style={{
              flex: 1,
              maxWidth: '6px',
              minWidth: '3px',
              margin: '0 1.5px',
              height: `${heightPx}px`,
              borderRadius: '3px',
              background: `linear-gradient(to top, ${accentColor} 0%, ${secondaryColor} 100%)`,
              boxShadow: `0 0 8px ${secondaryColor}66`,
            }}
          />
        );
      })}
    </div>
  );
};
