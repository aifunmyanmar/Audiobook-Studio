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
  FlameIcon,
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
    ? logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:') || logoUrl.startsWith('/')
      ? logoUrl
      : staticFile(logoUrl.replace(/^\//, ''))
    : null;

  // Resolve audio URL
  const resolvedAudio = audioUrl
    ? audioUrl.startsWith('data:') || audioUrl.startsWith('http') || audioUrl.startsWith('blob:') || audioUrl.startsWith('/')
      ? audioUrl
      : staticFile(audioUrl.replace(/^\//, ''))
    : null;

  // Resolved Artwork URL
  const resolvedArtwork = artworkUrl
    ? artworkUrl.startsWith('data:') || artworkUrl.startsWith('http') || artworkUrl.startsWith('blob:') || artworkUrl.startsWith('/')
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
        {/* Layout: Top title bar → Center artwork image → Bottom author/waveform console */}
        {/* All in an absolute positioned flex-column, fully bounded within 1920×1080 */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-2-center-stage' && (
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
                  border: '1.5px solid rgba(255, 255, 255, 0.20)',
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
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '48px 80px',
                zIndex: 30,
                boxSizing: 'border-box',
              }}
            >
            {/* ── Top Title + Subtitle Header Card (fixed ~130px) ── */}
            <div
              style={{
                width: '100%',
                maxWidth: '1300px',
                textAlign: 'center',
                padding: '22px 48px',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.90)',
                border: '1.5px solid rgba(255, 255, 255, 0.20)',
                boxShadow: '0 16px 50px rgba(0,0,0,0.75)',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <h1
                style={{
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                  fontSize: `${Math.min(headerFontSize || 66, 72)}px`,
                  fontWeight: 800,
                  color: titleColor,
                  lineHeight: '1.3',
                  margin: 0,
                  textShadow: '0 4px 22px rgba(0,0,0,0.98)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  maxHeight: '100px',
                }}
              >
                {headerTitle}
              </h1>
              {subheader && (
                <p
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${Math.min(subheaderFontSize || 26, 30)}px`,
                    fontWeight: 600,
                    color: subTitleColor,
                    margin: '8px 0 0 0',
                    overflow: 'hidden',
                    maxHeight: '44px',
                  }}
                >
                  {subheader}
                </p>
              )}
            </div>

            {/* ── Center Artwork: flex:1 container, artwork image centered, max height 540px ── */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0',
                overflow: 'hidden',
              }}
            >
              {resolvedArtwork ? (
                <img
                  src={resolvedArtwork}
                  alt="Cover"
                  style={{
                    maxHeight: '520px',
                    maxWidth: '380px',
                    width: 'auto',
                    height: 'auto',
                    borderRadius: artworkShape === 'circle' ? '50%' : artworkShape === 'square' ? '20px' : '16px',
                    objectFit: 'cover',
                    boxShadow: `0 30px 80px rgba(0,0,0,0.95), 0 0 60px ${theme.accentColor}44`,
                    border: '2px solid rgba(255,255,255,0.18)',
                    filter: `drop-shadow(0 0 40px ${theme.accentColor}55)`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '340px',
                    height: '480px',
                    borderRadius: '20px',
                    background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 50px ${theme.accentColor}33`,
                    border: '1.5px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <BookOpenIcon size={72} color={theme.accentColor} />
                </div>
              )}
            </div>

            {/* ── Bottom Console: Author + Wide Waveform + Episode Badge (fixed ~90px) ── */}
            <div
              style={{
                width: '100%',
                maxWidth: '1380px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '28px',
                padding: '18px 32px',
                borderRadius: '26px',
                background: 'rgba(15, 23, 42, 0.92)',
                border: '1.5px solid rgba(255, 255, 255, 0.20)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {authorName ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <FeatherPenIcon size={20} color={authorCol} />
                  <span
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${authorFontSize || 24}px`,
                      fontWeight: 700,
                      color: authorCol,
                      lineHeight: '1.4',
                    }}
                  >
                    {authorName}
                  </span>
                </div>
              ) : <div />}

              <div style={{ flex: 1, maxWidth: '840px' }}>
                <AudioWaveformVisualizer
                  barCount={68}
                  accentColor={theme.accentColor}
                  secondaryColor={theme.secondaryColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>

              {episodeText && (
                <div
                  style={{
                    padding: '10px 26px',
                    borderRadius: '999px',
                    background: epBgCol,
                    color: epTextCol,
                    fontSize: `${episodeFontSize || 18}px`,
                    fontWeight: 800,
                    border: `1.5px solid ${theme.accentColor}`,
                    flexShrink: 0,
                    lineHeight: '1.4',
                  }}
                >
                  {episodeText}
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 3: CINEMATIC FULL-BLEED HERO (Right Full Artwork) */}
        {/* Layout: Right side = full-height artwork image (900px wide, absolute).  */}
        {/* Left side = text column (980px wide, absolute), flex column.            */}
        {/* Both are absolutely positioned siblings inside a 1920×1080 container.  */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-3-cinematic-wide' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
            {/* Right: Full-bleed artwork panel (absolute, right-aligned, 900px wide) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '900px',
                height: '1080px',
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
                  <BookOpenIcon size={80} color="#64748b" />
                </div>
              )}
              {/* Fade to left so text is readable */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to left, transparent 20%, rgba(15,23,42,0.85) 70%, rgba(15,23,42,0.99) 100%)',
                }}
              />
            </div>

            {/* Left: Text + waveform column (absolute, left-aligned, 1060px wide) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1060px',
                height: '1080px',
                padding: '90px 60px 80px 90px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 2,
                boxSizing: 'border-box',
              }}
            >
              {/* Top: Logo + Episode tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                {resolvedLogo && (
                  <img
                    src={resolvedLogo}
                    alt="Logo"
                    style={{ height: '36px', maxWidth: '120px', objectFit: 'contain', borderRadius: '6px' }}
                  />
                )}

                {episodeText && (
                  <div
                    style={{
                      padding: '8px 24px',
                      borderRadius: '999px',
                      background: epBgCol,
                      color: epTextCol,
                      fontSize: `${episodeFontSize || 18}px`,
                      fontWeight: 800,
                      border: '1.5px solid rgba(255,255,255,0.22)',
                      lineHeight: '1.4',
                    }}
                  >
                    {episodeText}
                  </div>
                )}
              </div>

              {/* Middle: Title + Subtitle (flex:1 content) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center', padding: '30px 0' }}>
                <h1
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${headerFontSize || 76}px`,
                    lineHeight: '1.28',
                    fontWeight: 900,
                    color: titleColor,
                    margin: 0,
                    textShadow: '0 4px 25px rgba(0,0,0,1)',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    maxHeight: '420px',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${subheaderFontSize || 30}px`,
                      fontWeight: 600,
                      color: subTitleColor,
                      margin: 0,
                      lineHeight: '1.45',
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      maxHeight: '100px',
                    }}
                  >
                    {subheader}
                  </p>
                )}
              </div>

              {/* Bottom: Author + waveform */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
                {authorName && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 24px',
                      borderRadius: '16px',
                      background: authorBgColor || 'rgba(30,41,59,0.92)',
                      border: '1.5px solid rgba(255,255,255,0.28)',
                      width: 'fit-content',
                    }}
                  >
                    <FeatherPenIcon size={20} color={authorCol} />
                    <span
                      style={{
                        fontFamily: "'PannYeat', 'Padauk', sans-serif",
                        fontSize: `${authorFontSize || 24}px`,
                        fontWeight: 700,
                        color: authorCol,
                        lineHeight: '1.4',
                      }}
                    >
                      {authorName}
                    </span>
                  </div>
                )}

                <div style={{ width: '100%', maxWidth: '700px' }}>
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
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 4: MINIMALIST STUDIO GLASS (Lower Console Dock) */}
        {/* Layout: Transparent top (shows background), bottom console dock (200px).  */}
        {/* Top: logo/badge left + episode badge right (absolute, 40px from top).     */}
        {/* Bottom: mini artwork + title/subtitle/author + waveform (absolute dock).  */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-4-minimal-glass' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
            {/* Top Header Row: Logo/Badge (left) + Episode badge (right) */}
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
              ) : <div />}

              {episodeText && (
                <div
                  style={{
                    padding: '8px 24px',
                    borderRadius: '999px',
                    background: epBgCol,
                    color: epTextCol,
                    fontSize: `${episodeFontSize || 18}px`,
                    fontWeight: 800,
                    border: `1.5px solid ${theme.accentColor}`,
                    lineHeight: '1.4',
                  }}
                >
                  {episodeText}
                </div>
              )}
            </div>

            {/* Bottom Floating Console Dock — fixed 210px tall, leaves 80%+ screen for bg video */}
            <div
              style={{
                position: 'absolute',
                bottom: '48px',
                left: '80px',
                right: '80px',
                height: '210px',
                borderRadius: '32px',
                background: 'rgba(10, 15, 30, 0.93)',
                border: '1.5px solid rgba(255, 255, 255, 0.24)',
                boxShadow: '0 25px 70px rgba(0,0,0,0.90), inset 0 1px 0 rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '28px',
                padding: '0 36px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Left: Miniature Artwork Square */}
              <div
                style={{
                  width: '154px',
                  height: '154px',
                  borderRadius: artworkShape === 'circle' ? '50%' : '20px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.28)',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.80)',
                  background: '#1e293b',
                }}
              >
                {resolvedArtwork ? (
                  <img src={resolvedArtwork} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpenIcon size={44} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* Center: Title + Subtitle + Author — overflow hidden, NO nowrap */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px', overflow: 'hidden' }}>
                <h1
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${Math.min(headerFontSize || 50, 56)}px`,
                    fontWeight: 900,
                    color: titleColor,
                    margin: 0,
                    lineHeight: '1.28',
                    overflow: 'hidden',
                    maxHeight: '80px',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line',
                    textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p
                    style={{
                      fontFamily: "'PannYeat', 'Padauk', sans-serif",
                      fontSize: `${Math.min(subheaderFontSize || 22, 24)}px`,
                      fontWeight: 600,
                      color: subTitleColor,
                      margin: 0,
                      overflow: 'hidden',
                      maxHeight: '38px',
                      wordBreak: 'break-word',
                      lineHeight: '1.4',
                    }}
                  >
                    {subheader}
                  </p>
                )}
                {authorName && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexShrink: 0 }}>
                    <FeatherPenIcon size={16} color={authorCol} />
                    <span
                      style={{
                        fontFamily: "'PannYeat', 'Padauk', sans-serif",
                        fontSize: `${Math.min(authorFontSize || 20, 22)}px`,
                        fontWeight: 700,
                        color: authorCol,
                        lineHeight: '1.4',
                      }}
                    >
                      {authorName}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Audio Equalizer Bars */}
              <div style={{ width: '460px', flexShrink: 0 }}>
                <AudioWaveformVisualizer
                  barCount={48}
                  accentColor={theme.accentColor}
                  secondaryColor={theme.secondaryColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPOSITION 5: ISOMETRIC MODERN ALBUM (Vinyl & 3D Book)   */}
        {/* Layout: Left column = 3D perspective artwork (centered in 560px wide col) */}
        {/* Right column = flex:1 glass card — EXPLICIT height 960px   */}
        {/* Parent: absolute inset with explicit height 960px for proper flex layout */}
        {/* ======================================================== */}
        {videoCompositionId === 'video-comp-5-isometric-vinyl' && (
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '80px',
              right: '80px',
              height: '960px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '60px',
              zIndex: 30,
            }}
          >
            {/* Left: 3D Isometric Artwork with decorative acoustic ring */}
            <div
              style={{
                width: '520px',
                height: '960px',
                flexShrink: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Outer concentric ring */}
              <div
                style={{
                  position: 'absolute',
                  width: '480px',
                  height: '480px',
                  borderRadius: '50%',
                  border: `2px dashed ${theme.accentColor}55`,
                  boxShadow: `0 0 60px ${theme.accentColor}33`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              {/* Inner ring */}
              <div
                style={{
                  position: 'absolute',
                  width: '340px',
                  height: '340px',
                  borderRadius: '50%',
                  border: `1px dashed ${theme.accentColor}30`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              {/* 3D Rotated Artwork */}
              <div
                style={{
                  transform: 'perspective(1100px) rotateY(-18deg) rotateX(6deg) scale(1.02)',
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.95))',
                  zIndex: 1,
                }}
              >
                <ArtworkHeroCard
                  artworkUrl={artworkUrl}
                  shape={artworkShape}
                  artworkWidth={370}
                  title={headerTitle}
                  authorName={authorName}
                  accentColor={theme.accentColor}
                  loopDurationFrames={loopDurationFrames}
                />
              </div>
            </div>

            {/* Right: Information & Waveform Glass Card — explicit height 960px */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: '960px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '52px 50px',
                borderRadius: '32px',
                background: 'rgba(15, 23, 42, 0.90)',
                border: '1.5px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 25px 65px rgba(0,0,0,0.75)',
                boxSizing: 'border-box',
              }}
            >
              {/* Top: Logo + Episode tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                {resolvedLogo ? (
                  <img
                    src={resolvedLogo}
                    alt="Logo"
                    style={{ height: '36px', maxWidth: '120px', objectFit: 'contain', borderRadius: '6px' }}
                  />
                ) : <div />}

                {episodeText && (
                  <div
                    style={{
                      padding: '8px 24px',
                      borderRadius: '999px',
                      background: epBgCol,
                      color: epTextCol,
                      fontSize: `${episodeFontSize || 18}px`,
                      fontWeight: 800,
                      border: `1.5px solid ${theme.accentColor}`,
                      lineHeight: '1.4',
                    }}
                  >
                    {episodeText}
                  </div>
                )}
              </div>

              {/* Middle: Title + Subtitle — flex:1 centered */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center', padding: '30px 0' }}>
                <h1
                  style={{
                    fontFamily: "'PannYeat', 'Padauk', sans-serif",
                    fontSize: `${headerFontSize || 72}px`,
                    lineHeight: '1.32',
                    fontWeight: 900,
                    color: titleColor,
                    margin: 0,
                    textShadow: '0 4px 22px rgba(0,0,0,0.98)',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    maxHeight: '380px',
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
                      lineHeight: '1.45',
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      maxHeight: '90px',
                    }}
                  >
                    {subheader}
                  </p>
                )}
              </div>

              {/* Bottom: Author badge + waveform */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', flexShrink: 0 }}>
                {authorName && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 24px',
                      borderRadius: '16px',
                      background: authorBgColor || 'rgba(30, 41, 59, 0.92)',
                      border: '1.5px solid rgba(255,255,255,0.22)',
                      width: 'fit-content',
                    }}
                  >
                    <FeatherPenIcon size={20} color={authorCol} />
                    <span
                      style={{
                        fontFamily: "'PannYeat', 'Padauk', sans-serif",
                        fontSize: `${authorFontSize || 24}px`,
                        fontWeight: 700,
                        color: authorCol,
                        lineHeight: '1.4',
                      }}
                    >
                      {authorName}
                    </span>
                  </div>
                )}

                <div style={{ width: '100%' }}>
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
                {resolvedLogo ? <img src={resolvedLogo} alt="Logo" style={{ height: '36px', maxWidth: '120px', objectFit: 'contain', borderRadius: '6px' }} /> : <div />}
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
