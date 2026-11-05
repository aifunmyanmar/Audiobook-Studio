import React from 'react';
import { staticFile, Audio, useVideoConfig } from 'remotion';
import {
  AudiobookProps,
  AUDIOBOOK_THEMES,
  AUDIOBOOK_GRADIENT_PRESETS,
} from './types';
import { PresetRenderer } from './presets/PresetRenderer';
import { ArtworkHeroCard } from './ArtworkHeroCard';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import {
  FeatherPenIcon,
  HeadphonesIcon,
  FlameIcon,
  ZapIcon,
  DiscIcon,
  BookOpenIcon,
} from './icons';

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
  videoCompositionId = 'video-comp-1-classic',
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

  // Resolved Artwork URL
  const resolvedArtwork = artworkUrl
    ? artworkUrl.startsWith('data:') || artworkUrl.startsWith('http') || artworkUrl.startsWith('blob:') || artworkUrl.startsWith('/api/')
      ? artworkUrl
      : staticFile(artworkUrl.replace(/^\//, ''))
    : null;

  const titleColor = headerTextColor || '#ffffff';
  const subTitleColor = subheaderTextColor || 'rgba(241, 245, 249, 0.95)';
  const authorCol = authorTextColor || '#fbbf24';
  const epTextCol = episodeTextColor || '#ffffff';
  const epBgCol = episodeBgColor || 'rgba(15, 23, 42, 0.90)';

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        background: bgStyle,
        overflow: 'hidden',
        fontFamily: "'PannYeat', 'Padauk', sans-serif",
        color: '#ffffff',
      }}
    >
      {/* 1920x1080 Base Scaled Container (Smoothly scales to 2K/1440p) */}
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

        {/* ======================================================== */}
        {/* COMPOSITION 1: CLASSIC STUDIO SPLIT (DEFAULT) */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-1-classic' && (
          <>
            {/* Top Brand Logo */}
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
                }}
              >
                <img
                  src={resolvedLogo}
                  alt="Logo"
                  style={{ height: '36px', maxWidth: '120px', objectFit: 'contain', borderRadius: '6px' }}
                />
              </div>
            )}

            {/* Episode Tag Badge */}
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
                  background: epBgCol,
                  border: `1.5px solid ${theme.accentColor}`,
                  boxShadow: `0 0 20px ${theme.accentColor}44`,
                }}
              >
                <span
                  style={{
                    fontSize: `${episodeFontSize}px`,
                    fontWeight: 800,
                    color: epTextCol,
                    letterSpacing: '0.04em',
                    lineHeight: '1.4',
                  }}
                >
                  {episodeText}
                </span>
              </div>
            )}

            {/* Main Content Area: Left Artwork + Right Glass Typography Card */}
            <div
              style={{
                position: 'absolute',
                top: '120px',
                bottom: '70px',
                left: '80px',
                right: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '64px',
                zIndex: 30,
              }}
            >
              {/* Left Hero Artwork Card */}
              <div style={{ flexShrink: 0 }}>
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

              {/* Right Text Content Glass Card */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  maxHeight: '620px',
                  height: '100%',
                  padding: '36px 42px',
                  borderRadius: '32px',
                  background: isLightBg ? 'rgba(15, 23, 42, 0.90)' : 'rgba(15, 23, 42, 0.82)',
                  border: isLightBg ? '1.5px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.16)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, width: '100%', zIndex: 10 }}>
                  <h1
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${headerFontSize}px`,
                      lineHeight: '1.35',
                      paddingBottom: '8px',
                      margin: 0,
                      fontWeight: 700,
                      color: titleColor,
                      textShadow: '0 4px 20px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.95)',
                      maxHeight: `${Math.round(headerFontSize * 1.35 * 2.6)}px`,
                      minHeight: `${Math.round(headerFontSize * 1.2)}px`,
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {headerTitle || 'Audiobook Title'}
                  </h1>

                  {subheader && (
                    <p
                      style={{
                        fontFamily: "'PannYeat', 'Padauk', sans-serif",
                        fontSize: `${subheaderFontSize}px`,
                        lineHeight: '1.48',
                        paddingBottom: '6px',
                        color: subTitleColor,
                        margin: 0,
                        fontWeight: 600,
                        textShadow: '0 3px 10px rgba(0, 0, 0, 0.7)',
                        maxHeight: `${Math.round(subheaderFontSize * 1.48 * 2.6)}px`,
                        minHeight: `${Math.round(subheaderFontSize * 1.2)}px`,
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >
                      {subheader}
                    </p>
                  )}
                </div>

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
                      zIndex: 10,
                    }}
                  >
                    <FeatherPenIcon size={20} color={authorCol} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        စာရေးသူ
                      </span>
                      <span
                        style={{
                          fontFamily: "'PannYeat', 'Padauk', sans-serif",
                          fontSize: `${authorFontSize}px`,
                          fontWeight: 700,
                          color: authorCol,
                          lineHeight: '1.38',
                          paddingBottom: '2px',
                        }}
                      >
                        {authorName}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '8px', width: '100%', zIndex: 10 }}>
                  <AudioWaveformVisualizer
                    barCount={56}
                    accentColor={theme.accentColor}
                    secondaryColor={theme.secondaryColor}
                    loopDurationFrames={loopDurationFrames}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 2: CENTER STAGE SPOTLIGHT (Prominent Artwork) */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-2-center-stage' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '45px 80px 45px 80px',
              zIndex: 30,
              boxSizing: 'border-box',
            }}
          >
            {/* Top Marquee Header Card */}
            <div
              style={{
                width: '100%',
                maxWidth: '1280px',
                textAlign: 'center',
                padding: '20px 40px',
                borderRadius: '26px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 16px 45px rgba(0,0,0,0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <h1
                style={{
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                  fontSize: `${headerFontSize || 68}px`,
                  fontWeight: 800,
                  color: titleColor,
                  lineHeight: '1.3',
                  margin: 0,
                  textShadow: '0 4px 20px rgba(0,0,0,0.95)',
                  whiteSpace: 'pre-line',
                }}
              >
                {headerTitle}
              </h1>
              {subheader && (
                <p
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${subheaderFontSize || 26}px`,
                    fontWeight: 600,
                    color: subTitleColor,
                    margin: 0,
                  }}
                >
                  {subheader}
                </p>
              )}
            </div>

            {/* Middle Centerpiece 3D Floating Artwork */}
            <div
              style={{
                transform: 'scale(0.95)',
                filter: `drop-shadow(0 25px 50px rgba(0,0,0,0.95)) drop-shadow(0 0 45px ${theme.accentColor}55)`,
                margin: '10px 0',
              }}
            >
              <ArtworkHeroCard
                artworkUrl={artworkUrl}
                shape={artworkShape}
                artworkWidth={390}
                title={headerTitle}
                authorName={authorName}
                accentColor={theme.accentColor}
                loopDurationFrames={loopDurationFrames}
              />
            </div>

            {/* Bottom Symphony Console: Author, Wide Visualizer, Episode Badge */}
            <div
              style={{
                width: '100%',
                maxWidth: '1360px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                padding: '14px 28px',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.90)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 16px 45px rgba(0,0,0,0.7)',
              }}
            >
              {authorName ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <FeatherPenIcon size={20} color={authorCol} />
                  <span style={{ fontSize: `${authorFontSize}px`, fontWeight: 700, color: authorCol }}>
                    {authorName}
                  </span>
                </div>
              ) : <div />}

              {/* Wide Panoramic Audio Waveform */}
              <div style={{ flex: 1, maxWidth: '800px' }}>
                <AudioWaveformVisualizer
                  barCount={64}
                  accentColor={theme.accentColor}
                  secondaryColor={theme.secondaryColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>

              {episodeText && (
                <div
                  style={{
                    padding: '8px 24px',
                    borderRadius: '999px',
                    background: epBgCol,
                    color: epTextCol,
                    fontSize: `${episodeFontSize}px`,
                    fontWeight: 800,
                    border: `1.5px solid ${theme.accentColor}`,
                    flexShrink: 0,
                  }}
                >
                  {episodeText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 3: CINEMATIC FULL-BLEED HERO (Right Full Artwork) */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-3-cinematic-wide' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 30 }}>
            {/* Left High-Impact Text & Visualizer Column (52%) */}
            <div
              style={{
                width: '52%',
                height: '100%',
                padding: '90px 60px 80px 90px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(to right, rgba(15,23,42,0.98) 65%, rgba(15,23,42,0.7) 90%, transparent 100%)',
                zIndex: 2,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: `1.5px solid ${theme.accentColor}`,
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                  }}
                >
                  <HeadphonesIcon size={16} color={theme.accentColor} />
                  <span>FULL AUDIOBOOK MASTER</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      padding: '8px 24px',
                      borderRadius: '999px',
                      background: epBgCol,
                      color: epTextCol,
                      fontSize: `${episodeFontSize}px`,
                      fontWeight: 800,
                      border: '1.5px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {episodeText}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h1
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${headerFontSize || 74}px`,
                    lineHeight: '1.26',
                    fontWeight: 900,
                    color: titleColor,
                    margin: 0,
                    textShadow: '0 4px 25px rgba(0,0,0,1)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${subheaderFontSize || 28}px`,
                      fontWeight: 600,
                      color: subTitleColor,
                      margin: 0,
                    }}
                  >
                    {subheader}
                  </p>
                )}
              </div>

              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 24px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(30,41,59,0.90)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    width: 'fit-content',
                  }}
                >
                  <FeatherPenIcon size={20} color={authorCol} />
                  <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 700, color: authorCol }}>
                    {authorName}
                  </span>
                </div>
              )}

              <div style={{ width: '100%', maxWidth: '640px' }}>
                <AudioWaveformVisualizer
                  barCount={52}
                  accentColor={theme.accentColor}
                  secondaryColor={theme.secondaryColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>
            </div>

            {/* Right Massive Artwork Presentation (48%) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '48%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 1,
              }}
            >
              {resolvedArtwork ? (
                <img
                  src={resolvedArtwork}
                  alt="Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpenIcon size={64} color="#64748b" />
                </div>
              )}
              {/* Soft Leftward Vignette Fade */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to left, transparent 25%, rgba(15,23,42,0.98) 100%)',
                }}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 4: MINIMALIST STUDIO GLASS (Lower Console Dock) */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-4-minimal-glass' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
            {/* Top Minimal Header */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '80px',
                right: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {resolvedLogo ? (
                <img src={resolvedLogo} alt="Logo" style={{ height: '36px', borderRadius: '6px' }} />
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#94a3b8',
                  }}
                >
                  <HeadphonesIcon size={16} color={theme.accentColor} />
                  <span>AUDIOBOOK PRO STUDIO</span>
                </div>
              )}

              {episodeText && (
                <div
                  style={{
                    padding: '8px 24px',
                    borderRadius: '999px',
                    background: epBgCol,
                    color: epTextCol,
                    fontSize: `${episodeFontSize}px`,
                    fontWeight: 800,
                    border: `1.5px solid ${theme.accentColor}`,
                  }}
                >
                  {episodeText}
                </div>
              )}
            </div>

            {/* Bottom Floating Console Dock (Leaves 80% screen clear for background video) */}
            <div
              style={{
                position: 'absolute',
                bottom: '50px',
                left: '80px',
                right: '80px',
                height: '190px',
                borderRadius: '32px',
                background: 'rgba(15, 23, 42, 0.90)',
                border: '1.5px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 25px 70px rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 36px',
                gap: '30px',
                boxSizing: 'border-box',
              }}
            >
              {/* Left Miniature Artwork */}
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: artworkShape === 'circle' ? '50%' : '18px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.7)',
                  background: '#1e293b',
                }}
              >
                {resolvedArtwork ? (
                  <img src={resolvedArtwork} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpenIcon size={40} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* Center Title & Author */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h1
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${headerFontSize || 54}px`,
                    fontWeight: 900,
                    color: titleColor,
                    margin: 0,
                    lineHeight: '1.25',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${subheaderFontSize || 22}px`,
                      fontWeight: 600,
                      color: subTitleColor,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {subheader}
                  </p>
                )}
                {authorName && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <FeatherPenIcon size={16} color={authorCol} />
                    <span style={{ fontSize: `${authorFontSize || 20}px`, fontWeight: 700, color: authorCol }}>
                      {authorName}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Continuous Audio Equalizer */}
              <div style={{ width: '480px', flexShrink: 0 }}>
                <AudioWaveformVisualizer
                  barCount={46}
                  accentColor={theme.accentColor}
                  secondaryColor={theme.secondaryColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 5: ISOMETRIC MODERN ALBUM (Vinyl & 3D Book) */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-5-isometric-vinyl' && (
          <div
            style={{
              position: 'absolute',
              inset: '60px 80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '60px',
              zIndex: 30,
            }}
          >
            {/* Left 3D Isometric Book & Concentric Acoustic Ring */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Concentric Acoustic Ring Backdrop */}
              <div
                style={{
                  position: 'absolute',
                  width: '450px',
                  height: '450px',
                  borderRadius: '50%',
                  border: `2px dashed ${theme.accentColor}55`,
                  boxShadow: `0 0 50px ${theme.accentColor}33`,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  transform: 'perspective(1100px) rotateY(-18deg) rotateX(6deg) scale(1.02)',
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.95))',
                }}
              >
                <ArtworkHeroCard
                  artworkUrl={artworkUrl}
                  shape={artworkShape}
                  artworkWidth={390}
                  title={headerTitle}
                  authorName={authorName}
                  accentColor={theme.accentColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>
            </div>

            {/* Right Information & Waveform Console Card */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxHeight: '620px',
                height: '100%',
                padding: '38px 46px',
                borderRadius: '32px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255, 255, 255, 0.20)',
                boxShadow: '0 25px 65px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    background: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#94a3b8',
                  }}
                >
                  <DiscIcon size={16} color={theme.accentColor} />
                  <span>HIGH FIDELITY AUDIO NOVEL</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      padding: '8px 24px',
                      borderRadius: '999px',
                      background: epBgCol,
                      color: epTextCol,
                      fontSize: `${episodeFontSize}px`,
                      fontWeight: 800,
                      border: `1.5px solid ${theme.accentColor}`,
                    }}
                  >
                    {episodeText}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h1
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${headerFontSize || 70}px`,
                    lineHeight: '1.3',
                    fontWeight: 900,
                    color: titleColor,
                    margin: 0,
                    textShadow: '0 4px 20px rgba(0,0,0,0.95)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${subheaderFontSize || 28}px`,
                      fontWeight: 600,
                      color: subTitleColor,
                      margin: 0,
                    }}
                  >
                    {subheader}
                  </p>
                )}
              </div>

              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 24px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(30, 41, 59, 0.90)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    width: 'fit-content',
                  }}
                >
                  <FeatherPenIcon size={20} color={authorCol} />
                  <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 700, color: authorCol }}>
                    {authorName}
                  </span>
                </div>
              )}

              <div style={{ width: '100%' }}>
                <AudioWaveformVisualizer
                  barCount={54}
                  accentColor={theme.accentColor}
                  secondaryColor={theme.secondaryColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 6: DRAMATIC BROADCAST & THRILLER */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-6-dramatic-broadcast' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
            {/* Top Broadcast Ribbon */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '75px',
                background: 'rgba(10, 10, 15, 0.96)',
                borderBottom: '2px solid rgba(239, 68, 68, 0.7)',
                boxShadow: '0 4px 25px rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 80px',
                zIndex: 40,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                    border: '1px solid #ef4444',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                  }}
                >
                  <ZapIcon size={14} color="#ffffff" />
                  <span>DRAMATIC AUDIO BROADCAST</span>
                </div>
                {resolvedLogo && <img src={resolvedLogo} alt="Logo" style={{ height: '32px' }} />}
              </div>

              {episodeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 24px',
                    borderRadius: '8px',
                    background: epBgCol || '#b91c1c',
                    color: epTextCol,
                    fontSize: `${episodeFontSize || 20}px`,
                    fontWeight: 900,
                    border: '1.5px solid #ef4444',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  <FlameIcon size={16} color={epTextCol} />
                  <span>{episodeText}</span>
                </div>
              )}
            </div>

            {/* Main Stage: Left Dramatic Artwork + Right Tension Card */}
            <div
              style={{
                position: 'absolute',
                top: '120px',
                bottom: '50px',
                left: '80px',
                right: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '60px',
              }}
            >
              {/* Left Action 3D Cover */}
              <div
                style={{
                  transform: 'perspective(1000px) rotateY(8deg) scale(1.02)',
                  filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.98)) drop-shadow(0 0 40px rgba(220, 38, 38, 0.45))',
                  flexShrink: 0,
                }}
              >
                <ArtworkHeroCard
                  artworkUrl={artworkUrl}
                  shape={artworkShape}
                  artworkWidth={400}
                  title={headerTitle}
                  authorName={authorName}
                  accentColor="#ef4444"
                  loopDurationFrames={loopDurationFrames}
                />
              </div>

              {/* Right Tension Typography & Equalizer */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  maxHeight: '620px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '38px 46px',
                  borderRadius: '28px',
                  background: 'rgba(15, 15, 22, 0.92)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: '0 25px 65px rgba(0,0,0,0.85), inset 0 0 40px rgba(220, 38, 38, 0.1)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h1
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${headerFontSize || 70}px`,
                      lineHeight: '1.26',
                      fontWeight: 950,
                      color: titleColor,
                      margin: 0,
                      textShadow: '0 0 30px rgba(220, 38, 38, 0.7), 0 4px 15px rgba(0,0,0,1)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {headerTitle}
                  </h1>

                  {subheader && (
                    <div
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        borderLeft: '4px solid #ef4444',
                        width: 'fit-content',
                        maxWidth: '100%',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'PannYeat', 'Padauk', sans-serif",
                          fontSize: `${subheaderFontSize || 26}px`,
                          fontWeight: 700,
                          color: subTitleColor,
                          margin: 0,
                          lineHeight: '1.35',
                        }}
                      >
                        {subheader}
                      </p>
                    </div>
                  )}
                </div>

                {authorName && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 24px',
                      borderRadius: '14px',
                      background: authorBgColor || 'rgba(24, 24, 30, 0.95)',
                      border: '1.5px solid rgba(239, 68, 68, 0.4)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                      width: 'fit-content',
                    }}
                  >
                    <FeatherPenIcon size={20} color={authorCol} />
                    <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 800, color: authorCol }}>
                      {authorName}
                    </span>
                  </div>
                )}

                <div style={{ width: '100%' }}>
                  <AudioWaveformVisualizer
                    barCount={56}
                    accentColor="#ef4444"
                    secondaryColor="#f97316"
                    loopDurationFrames={loopDurationFrames}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
