import React from 'react';
import { Video, staticFile } from 'remotion';

interface PresetCustomVideoProps {
  videoUrl?: string;
}

export const PresetCustomVideo: React.FC<PresetCustomVideoProps> = ({ videoUrl }) => {
  if (!videoUrl) {
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
    videoUrl.startsWith('http') || videoUrl.startsWith('data:') || videoUrl.startsWith('blob:')
      ? videoUrl
      : staticFile(videoUrl.replace(/^\//, ''));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Video
        src={resolved}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.75,
        }}
        loop
        muted
      />
      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 5, 10, 0.45)',
        }}
      />
    </div>
  );
};
