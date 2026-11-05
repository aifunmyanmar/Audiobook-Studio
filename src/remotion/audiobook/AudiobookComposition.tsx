import React from 'react';
import { staticFile, Audio, useVideoConfig } from 'remotion';
import { AudiobookProps, AUDIOBOOK_THEMES, AUDIOBOOK_GRADIENT_PRESETS } from './types';
import { PresetRenderer } from './presets/PresetRenderer';
import { ArtworkHeroCard } from './ArtworkHeroCard';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

export const AudiobookComposition: React.FC<AudiobookProps> = ({
  headerTitle = 'သူ့ကိုမှ ချစ်မိသူ',
  subheader = 'မြန်မာ့လူမှုဘဝ ဝတ္ထုရှည်ကြီး',
  authorName = 'ဒေါ်ခင်ဆွေဦး',
  episodeText = 'အစအဆုံး',
  headerFontSize = 72,
  subheaderFontSize = 32,
  authorFontSize = 24,
  episodeFontSize = 18,
  artworkUrl,
  artworkShape = 'book-cover',
  artworkWidth = 420,
  logoUrl,
  audioUrl,
  bgVideoUrl,
  themeId = 'horror-halloween',
  gradientId,
  customGradient,
  loopDurationFrames = 600,
  headerTextColor,
  subheaderTextColor,
  authorTextColor,
  authorBgColor,
  episodeTextColor,
  episodeBgColor,
}) => {
  const { width = 1920, height = 1080 } = useVideoConfig();
  const scale = width / 1920;

  // Find current theme configuration
  const theme = AUDIOBOOK_THEMES.find((t) => t.id === themeId) || AUDIOBOOK_THEMES[0];
  
  // Resolve background gradient (custom gradient -> gradient preset -> theme default)
  const matchedGradientPreset = AUDIOBOOK_GRADIENT_PRESETS.find((g) => g.id === gradientId);
  const isLightBg = matchedGradientPreset?.category === 'light';
  const bgStyle = customGradient || matchedGradientPreset?.gradient || theme.gradientBg;

  // Resolve logo URL
  const resolvedLogo = logoUrl
    ? logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:') || logoUrl.startsWith('/api/')
      ? logoUrl
      : staticFile(logoUrl.replace(/^\//, ''))
    : null;

  // Resolve audio URL
  const resolvedAudio = audioUrl
    ? audioUrl.startsWith('data:') || audioUrl.startsWith('http') || audioUrl.startsWith('blob:') || audioUrl.startsWith('/api/')
      ? audioUrl
      : staticFile(audioUrl.replace(/^\//, ''))
    : null;

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        background: bgStyle,
        overflow: 'hidden',
        fontFamily: "'Padauk', sans-serif",
        color: '#ffffff',
      }}
    >
      {/* 2. Scaled High-Resolution Container (Handles 1080p and 2K seamlessly) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Full-duration Audio Playback */}
        {resolvedAudio && <Audio src={resolvedAudio} />}

        {/* Real Seamless Video Loop Background */}
        <PresetRenderer
          themeId={themeId}
          loopDurationFrames={loopDurationFrames}
          bgVideoUrl={bgVideoUrl}
          isLightBg={isLightBg}
        />

        {/* 4. Top Brand Header Bar & Episode Tag Badge (Direct Absolute Positioning, Dedicated Layer) */}
        {resolvedLogo && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '80px',
              zIndex: 50,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 20px',
              borderRadius: '999px',
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(0)',
            }}
          >
            <img
              src={resolvedLogo}
              alt="Logo"
              style={{
                height: '36px',
                maxWidth: '120px',
                objectFit: 'contain',
                borderRadius: '6px',
              }}
            />
          </div>
        )}

        {/* Episode Tag Badge - 100% Solid & Steady (ZERO flicker, ZERO disappear, Dedicated Compositor Layer) */}
        {episodeText && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '80px',
              zIndex: 50,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 24px',
              borderRadius: '999px',
              background: episodeBgColor || 'rgba(15, 23, 42, 0.90)',
              border: `1.5px solid ${theme.accentColor}`,
              boxShadow: `0 0 20px ${theme.accentColor}50`,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitFontSmoothing: 'antialiased',
              opacity: 1,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: theme.accentColor,
                boxShadow: `0 0 10px ${theme.accentColor}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'PannYeat', 'Padauk', sans-serif",
                fontSize: `${episodeFontSize}px`,
                fontWeight: 700,
                color: episodeTextColor || '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                lineHeight: '1.4',
                paddingBottom: '2px',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                opacity: 1,
              }}
            >
              {episodeText}
            </span>
          </div>
        )}

        {/* 5. Main Center Grid Layout: Left Hero Artwork / Right Typography */}
        <div
          style={{
            position: 'absolute',
            inset: '120px 80px 60px 80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '70px',
            zIndex: 10,
          }}
        >
          {/* Left Side: Single Primary Artwork Card (~45% width) */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '20px',
            }}
          >
            <ArtworkHeroCard
              artworkUrl={artworkUrl}
              shape={artworkShape}
              artworkWidth={artworkWidth}
              title={headerTitle}
              authorName={authorName}
              accentColor={theme.accentColor}
              loopDurationFrames={loopDurationFrames}
            />
          </div>

          {/* Right Side: Frosted Glass Card with Literary Typography & Visualizer (~55% width) */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '22px',
              padding: '36px 42px',
              borderRadius: '32px',
              background: isLightBg
                ? 'rgba(15, 23, 42, 0.90)'
                : 'rgba(15, 23, 42, 0.82)',
              border: isLightBg
                ? '1.5px solid rgba(255, 255, 255, 0.25)'
                : '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
            }}
          >
            {/* Header Title with TU001_Pann Yeat Font (Custom User Font Size) - 100% Solid & Steady */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, width: '100%', position: 'relative', zIndex: 10 }}>
              <h1
                style={{
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                  fontSize: `${headerFontSize}px`,
                  lineHeight: '1.35',
                  paddingBottom: '8px',
                  margin: 0,
                  fontWeight: 700,
                  color: headerTextColor || '#ffffff',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.95)',
                  display: 'block',
                  maxHeight: `${Math.round(headerFontSize * 1.35 * 2.6)}px`,
                  minHeight: `${Math.round(headerFontSize * 1.2)}px`,
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  opacity: 1,
                  visibility: 'visible',
                }}
              >
                {headerTitle || 'Audiobook Title'}
              </h1>

              {/* Subheader (Supporting Title, using PannYeat font) - 100% Solid & Steady */}
              {subheader && (
                <p
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${subheaderFontSize}px`,
                    lineHeight: '1.48',
                    paddingBottom: '6px',
                    color: subheaderTextColor || 'rgba(241, 245, 249, 0.95)',
                    margin: 0,
                    fontWeight: 600,
                    textShadow: '0 3px 10px rgba(0, 0, 0, 0.7)',
                    display: 'block',
                    maxHeight: `${Math.round(subheaderFontSize * 1.48 * 2.6)}px`,
                    minHeight: `${Math.round(subheaderFontSize * 1.2)}px`,
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    opacity: 1,
                    visibility: 'visible',
                  }}
                >
                  {subheader}
                </p>
              )}
            </div>

            {/* Author Badge (Labeled as စာရေးသူ) - 100% Solid & Steady */}
            {authorName && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 22px',
                  borderRadius: '16px',
                  background: authorBgColor || 'rgba(30, 41, 59, 0.88)',
                  border: '1.5px solid rgba(255, 255, 255, 0.22)',
                  width: 'fit-content',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  opacity: 1,
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                <span style={{ fontSize: '20px' }}>✍️</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    စာရေးသူ
                  </span>
                  <span
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${authorFontSize}px`,
                      fontWeight: 700,
                      color: authorTextColor || '#ffffff',
                      lineHeight: '1.38',
                      paddingBottom: '2px',
                      opacity: 1,
                    }}
                  >
                    {authorName}
                  </span>
                </div>
              </div>
            )}

            {/* Animated Harmonic Waveform Equalizer (Wider & Clean) */}
            <div style={{ marginTop: '8px', width: '100%', position: 'relative', zIndex: 10 }}>
              <AudioWaveformVisualizer
                barCount={56}
                accentColor={theme.accentColor}
                secondaryColor={theme.secondaryColor}
                loopDurationFrames={loopDurationFrames}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
