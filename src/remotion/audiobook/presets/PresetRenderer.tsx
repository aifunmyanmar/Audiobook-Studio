import React from 'react';
import { Loop, OffthreadVideo, staticFile } from 'remotion';
import { AudiobookThemeId, AUDIOBOOK_THEMES } from '../types';

interface PresetRendererProps {
  themeId: AudiobookThemeId;
  loopDurationFrames?: number;
  bgVideoUrl?: string;
  isLightBg?: boolean;
}

export const PresetRenderer: React.FC<PresetRendererProps> = ({
  themeId,
  loopDurationFrames = 600,
  bgVideoUrl,
  isLightBg = false,
}) => {
  const currentTheme = AUDIOBOOK_THEMES.find((t) => t.id === themeId) || AUDIOBOOK_THEMES[0];

  // Resolve video path: custom video or theme default
  let videoSrc = '';
  if (themeId === 'custom-video') {
    videoSrc = bgVideoUrl || '';
  } else if (currentTheme.videoFile) {
    videoSrc = currentTheme.videoFile;
  }

  if (!videoSrc) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '20px',
        }}
      >
        No background video selected. Please choose an MP4/WebM video file.
      </div>
    );
  }

  const resolved =
    videoSrc.startsWith('http') || videoSrc.startsWith('data:') || videoSrc.startsWith('blob:')
      ? videoSrc
      : staticFile(videoSrc.replace(/^\//, ''));

  const isAutumn = themeId === 'autumn-leaves';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Loop durationInFrames={loopDurationFrames}>
        <OffthreadVideo
          src={resolved}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: themeId === 'custom-video' ? 1.0 : (isLightBg ? 0.75 : (isAutumn ? 0.9 : 0.85)),
            mixBlendMode: (themeId === 'custom-video' || isAutumn) ? 'normal' : (isLightBg ? 'multiply' : 'screen'),
          }}
          muted
        />
      </Loop>
      {/* Cinematic Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isLightBg
            ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)'
            : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </div>
  );
};
