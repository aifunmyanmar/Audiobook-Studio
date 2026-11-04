import React from 'react';
import { staticFile, useVideoConfig } from 'remotion';
import { AUDIOBOOK_THEMES, AUDIOBOOK_GRADIENT_PRESETS, AudiobookThemeId } from './types';
import { PresetRenderer } from './presets/PresetRenderer';

export type AudiobookThumbnailLayoutId =
  | 'layout-1-split'
  | 'layout-2-center'
  | 'layout-3-editorial'
  | 'layout-4-isometric'
  | 'layout-5-bold'
  | 'layout-6-action';

export interface ThumbnailLayoutOption {
  id: AudiobookThumbnailLayoutId;
  labelMm: string;
  labelEn: string;
  descMm: string;
  badge: string;
}

export const THUMBNAIL_LAYOUT_OPTIONS: ThumbnailLayoutOption[] = [
  {
    id: 'layout-1-split',
    labelMm: 'ရုပ်ရှင်ဆန်ဆန် ဘေးချင်းယှဉ်',
    labelEn: 'Cinematic Split',
    descMm: 'ဘယ်ဘက် 3D စာအုပ်ကာဗာကြီး + ညာဘက် အလင်းပြန်စာသားနှင့် တံဆိပ်',
    badge: '1',
  },
  {
    id: 'layout-2-center',
    labelMm: 'အလယ်ဗဟို ပိုစတာ',
    labelEn: 'Center Poster',
    descMm: 'အလယ်တွင် စာအုပ်ကာဗာကြီး + အထက်ခေါင်းစီး + အောက်ခြေ တံဆိပ်ဝိုင်းများ',
    badge: '2',
  },
  {
    id: 'layout-3-editorial',
    labelMm: 'မဂ္ဂဇင်းစတိုင် Hero Right',
    labelEn: 'Magazine Hero',
    descMm: 'ညာဘက်အပြည့် ကာဗာကြီး + ဘယ်ဘက် ခမ်းနားသော စာစီစာရိုက်',
    badge: '3',
  },
  {
    id: 'layout-4-isometric',
    labelMm: 'အလှည့် 3D အထူးပြု',
    labelEn: 'Isometric 3D',
    descMm: 'စောင်းထားသော 3D စာအုပ် + ရောင်ပြန်ရိပ် + ရွှေရောင် အစအဆုံး တံဆိပ်',
    badge: '4',
  },
  {
    id: 'layout-5-bold',
    labelMm: 'CTR အမြင့်ဆုံး ခေါင်းစီးကြီး',
    labelEn: 'Mobile High-CTR',
    descMm: 'ဖုန်း screen အတွက် စာလုံးအကြီးဆုံး banner + စာရေးသူ + ကာဗာ',
    badge: '5',
  },
  {
    id: 'layout-6-action',
    labelMm: 'အက်ရှင် / လူမိုက် / သည်းထိတ်ရင်ဖို',
    labelEn: 'Action & Crime Thriller',
    descMm: 'ဒေါသထွက်ဖွယ် အနီ/ရွှေ ရဲရဲတောက် အလင်းရောင်ခြည် + စာလုံးထူကြမ်း + အက်ရှင် 3D ကာဗာ',
    badge: '6',
  },
];

export interface AudiobookThumbnailProps {
  headerTitle?: string;
  subheader?: string;
  authorName?: string;
  episodeText?: string;
  headerFontSize?: number;
  subheaderFontSize?: number;
  authorFontSize?: number;
  episodeFontSize?: number;
  artworkUrl?: string;
  artworkShape?: 'book-cover' | 'circle' | 'square';
  themeId?: AudiobookThemeId;
  gradientId?: string;
  customGradient?: string;
  bgVideoUrl?: string;
  headerTextColor?: string;
  subheaderTextColor?: string;
  authorTextColor?: string;
  authorBgColor?: string;
  episodeTextColor?: string;
  episodeBgColor?: string;
  layoutId?: AudiobookThumbnailLayoutId;
}

export const AudiobookThumbnailComposition: React.FC<AudiobookThumbnailProps> = ({
  headerTitle = 'သူ့ကိုမှ ချစ်မိသူ',
  subheader = 'မြန်မာ့လူမှုဘဝ ဝတ္ထုရှည်ကြီး',
  authorName = 'ဒေါ်ခင်ဆွေဦး',
  episodeText = 'အစအဆုံး',
  headerFontSize,
  subheaderFontSize,
  authorFontSize,
  episodeFontSize,
  artworkUrl,
  artworkShape = 'book-cover',
  themeId = 'horror-halloween',
  gradientId,
  customGradient,
  bgVideoUrl,
  headerTextColor,
  subheaderTextColor,
  authorTextColor,
  authorBgColor,
  episodeTextColor,
  episodeBgColor,
  layoutId = 'layout-1-split',
}) => {
  const { width = 1280, height = 720 } = useVideoConfig();
  const scale = width / 1280;

  const theme = AUDIOBOOK_THEMES.find((t) => t.id === themeId) || AUDIOBOOK_THEMES[0];
  const matchedGradientPreset = AUDIOBOOK_GRADIENT_PRESETS.find((g) => g.id === gradientId);
  const isLightBg = matchedGradientPreset?.category === 'light';
  const bgStyle = customGradient || matchedGradientPreset?.gradient || theme.gradientBg;

  const resolvedArtwork = artworkUrl
    ? artworkUrl.startsWith('data:') || artworkUrl.startsWith('http') || artworkUrl.startsWith('blob:') || artworkUrl.startsWith('/api/')
      ? artworkUrl
      : staticFile(artworkUrl.replace(/^\//, ''))
    : null;

  const titleColor = headerTextColor || '#ffffff';
  const subheaderColor = subheaderTextColor || '#cbd5e1';
  const authorColor = authorTextColor || '#fbbf24';
  const epTextColor = episodeTextColor || '#ffffff';
  const epBgColor = episodeBgColor || '#dc2626';

  // Render Artwork Helper
  const renderCover = (w: number, h: number, extraStyle: React.CSSProperties = {}) => {
    const isCircle = artworkShape === 'circle';
    const borderRadius = isCircle ? '50%' : '18px';

    return (
      <div
        style={{
          width: `${w}px`,
          height: `${h}px`,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          boxShadow: `0 24px 50px rgba(0,0,0,0.85), 0 0 40px ${theme.accentColor}44`,
          border: '2px solid rgba(255,255,255,0.22)',
          position: 'relative',
          flexShrink: 0,
          ...extraStyle,
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            }}
          >
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>📖</span>
            <span
              style={{
                fontFamily: "'PannYeat', 'Padauk', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: '1.4',
              }}
            >
              {headerTitle}
            </span>
          </div>
        )}
      </div>
    );
  };

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
      {/* 1280x720 Canvas Scaler */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1280px',
          height: '720px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Background Visualizer / Video */}
        <PresetRenderer
          themeId={themeId}
          loopDurationFrames={600}
          bgVideoUrl={bgVideoUrl}
          isLightBg={isLightBg}
        />

        {/* Global Dark Contrast Underlay for YouTube Legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.85) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ======================================================== */}
        {/* LAYOUT 1: CINEMATIC SPLIT (Left Artwork / Right Giant Title) */}
        {/* ======================================================== */}
        {layoutId === 'layout-1-split' && (
          <div
            style={{
              position: 'absolute',
              inset: '40px 60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '50px',
              zIndex: 10,
            }}
          >
            {/* Left Cover Artwork */}
            <div style={{ transform: 'perspective(800px) rotateY(6deg)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))' }}>
              {renderCover(380, 520)}
            </div>

            {/* Right Information Container */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '18px',
                padding: '30px 36px',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              }}
            >
              {/* Top Badge Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🎧</span> AUDIOBOOK SPECIAL
                </span>
                {episodeText && (
                  <div
                    style={{
                      padding: '8px 24px',
                      borderRadius: '999px',
                      background: epBgColor,
                      color: epTextColor,
                      fontSize: '22px',
                      fontWeight: 800,
                      boxShadow: `0 0 20px ${epBgColor}88`,
                    }}
                  >
                    {episodeText}
                  </div>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 66}px`,
                  fontWeight: 900,
                  lineHeight: '1.25',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}
              >
                {headerTitle}
              </h1>

              {/* Subheader */}
              {subheader && (
                <p
                  style={{
                    fontSize: `${subheaderFontSize || 26}px`,
                    fontWeight: 600,
                    lineHeight: '1.4',
                    margin: 0,
                    color: subheaderColor,
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  }}
                >
                  {subheader}
                </p>
              )}

              {/* Author Badge */}
              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    width: 'fit-content',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>✍️</span>
                  <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 700, color: authorColor }}>
                    {authorName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 2: POSTER CENTERPIECE (Center 3D Cover, Top Title) */}
        {/* ======================================================== */}
        {layoutId === 'layout-2-center' && (
          <div
            style={{
              position: 'absolute',
              inset: '30px 60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            {/* Top Giant Title Banner */}
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '16px 24px',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
              }}
            >
              <h1
                style={{
                  fontSize: `${headerFontSize || 62}px`,
                  fontWeight: 900,
                  lineHeight: '1.25',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}
              >
                {headerTitle}
              </h1>
              {subheader && (
                <p style={{ fontSize: `${subheaderFontSize || 22}px`, fontWeight: 600, color: subheaderColor, margin: '6px 0 0 0' }}>
                  {subheader}
                </p>
              )}
            </div>

            {/* Center Hero Book Artwork */}
            <div style={{ transform: 'perspective(900px) rotateX(4deg)', filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.9))' }}>
              {renderCover(340, 410)}
            </div>

            {/* Bottom Row: Author Left / Episode Badge Right */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {authorName ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 24px',
                    borderRadius: '999px',
                    background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>✍️</span>
                  <span style={{ fontSize: `${authorFontSize || 22}px`, fontWeight: 700, color: authorColor }}>{authorName}</span>
                </div>
              ) : <div />}

              {episodeText && (
                <div
                  style={{
                    padding: '12px 36px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 26}px`,
                    fontWeight: 900,
                    boxShadow: `0 0 30px ${epBgColor}aa`,
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  🔥 {episodeText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 3: EDITORIAL RIGHT (Full-Bleed Cover Right, Left Text) */}
        {/* ======================================================== */}
        {layoutId === 'layout-3-editorial' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              zIndex: 10,
            }}
          >
            {/* Left Content Area (60%) */}
            <div
              style={{
                width: '60%',
                height: '100%',
                padding: '60px 50px 50px 70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '20px',
                background: 'linear-gradient(to right, rgba(15,23,42,0.98) 60%, rgba(15,23,42,0.7) 90%, transparent 100%)',
                zIndex: 2,
              }}
            >
              {episodeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 24px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 22}px`,
                    fontWeight: 800,
                    width: 'fit-content',
                    boxShadow: `0 0 20px ${epBgColor}88`,
                  }}
                >
                  <span>🎧</span> {episodeText}
                </div>
              )}

              <h1
                style={{
                  fontSize: `${headerFontSize || 68}px`,
                  fontWeight: 900,
                  lineHeight: '1.22',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}
              >
                {headerTitle}
              </h1>

              {subheader && (
                <p style={{ fontSize: `${subheaderFontSize || 26}px`, fontWeight: 600, color: subheaderColor, margin: 0 }}>
                  {subheader}
                </p>
              )}

              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 24px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(30,41,59,0.9)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    width: 'fit-content',
                    marginTop: '10px',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>✍️</span>
                  <span style={{ fontSize: `${authorFontSize || 26}px`, fontWeight: 700, color: authorColor }}>{authorName}</span>
                </div>
              )}
            </div>

            {/* Right Large Cover Artwork (50% overlapping) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
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
                <div style={{ width: '100%', height: '100%', background: '#1e293b' }} />
              )}
              {/* Vignette fade to left */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to left, transparent 20%, rgba(15,23,42,0.95) 100%)',
                }}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 4: ISOMETRIC 3D (Angled 3D Book & Bold Badges) */}
        {/* ======================================================== */}
        {layoutId === 'layout-4-isometric' && (
          <div
            style={{
              position: 'absolute',
              inset: '40px 60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '40px',
              zIndex: 10,
            }}
          >
            {/* Left 3D Isometric Book Display */}
            <div
              style={{
                transform: 'perspective(1000px) rotateY(-18deg) rotateX(8deg) scale(1.05)',
                filter: 'drop-shadow(25px 25px 35px rgba(0,0,0,0.85))',
              }}
            >
              {renderCover(390, 530, {
                borderRight: '12px solid #334155',
                borderBottom: '8px solid #1e293b',
              })}
            </div>

            {/* Right High-Impact Info */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '36px',
                borderRadius: '32px',
                background: 'rgba(15, 23, 42, 0.90)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
              }}
            >
              {episodeText && (
                <div
                  style={{
                    padding: '10px 28px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 26}px`,
                    fontWeight: 900,
                    width: 'fit-content',
                    boxShadow: `0 0 25px ${epBgColor}99`,
                  }}
                >
                  ⭐ {episodeText} ⭐
                </div>
              )}

              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
                  fontWeight: 900,
                  lineHeight: '1.25',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}
              >
                {headerTitle}
              </h1>

              {subheader && (
                <p style={{ fontSize: `${subheaderFontSize || 24}px`, fontWeight: 600, color: subheaderColor, margin: 0 }}>
                  {subheader}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '10px',
                  padding: '10px 22px',
                  borderRadius: '16px',
                  background: authorBgColor || 'rgba(30,41,59,0.9)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  width: 'fit-content',
                }}
              >
                <span style={{ fontSize: '22px' }}>✍️</span>
                <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 700, color: authorColor }}>{authorName}</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 5: BOLD MINIMAL (High-CTR Mobile Optimized) */}
        {/* ======================================================== */}
        {layoutId === 'layout-5-bold' && (
          <div
            style={{
              position: 'absolute',
              inset: '30px 50px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            {/* Top Full Banner Title */}
            <div
              style={{
                width: '100%',
                padding: '20px 30px',
                borderRadius: '24px',
                background: 'linear-gradient(to right, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: `${headerFontSize || 66}px`,
                    fontWeight: 900,
                    lineHeight: '1.2',
                    margin: 0,
                    color: titleColor,
                    textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p style={{ fontSize: `${subheaderFontSize || 22}px`, fontWeight: 600, color: subheaderColor, margin: '4px 0 0 0' }}>
                    {subheader}
                  </p>
                )}
              </div>

              {episodeText && (
                <div
                  style={{
                    padding: '16px 36px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 32}px`,
                    fontWeight: 900,
                    boxShadow: `0 0 35px ${epBgColor}bb`,
                    flexShrink: 0,
                  }}
                >
                  {episodeText}
                </div>
              )}
            </div>

            {/* Bottom Row: Left Author Badge, Right Floating Artwork */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '24px 32px',
                  borderRadius: '24px',
                  background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  maxWidth: '550px',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
                  မြန်မာ အသံထွက်ဝတ္ထုရှည်
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>✍️</span>
                  <span style={{ fontSize: `${authorFontSize || 32}px`, fontWeight: 800, color: authorColor }}>
                    {authorName}
                  </span>
                </div>
              </div>

              {/* Right Floating Artwork */}
              <div style={{ transform: 'scale(0.95)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                {renderCover(340, 420)}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 6: ACTION & CRIME THRILLER (High-Tension Cinematic) */}
        {/* ======================================================== */}
        {layoutId === 'layout-6-action' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            {/* Dramatic Action Background Overlay: Blood-Red / Amber Spotlight & Gritty Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 75% 45%, rgba(220, 38, 38, 0.45) 0%, rgba(185, 28, 28, 0.22) 35%, rgba(10, 10, 15, 0.95) 80%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Subtle Diagonal Action Hazard Lines */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                opacity: 0.08,
                backgroundImage:
                  'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 2px, transparent 0, transparent 20px)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />

            {/* Left Content Area (~58% width) */}
            <div
              style={{
                width: '58%',
                height: '100%',
                padding: '45px 35px 45px 65px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '16px',
                zIndex: 10,
              }}
            >
              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                    border: '1.5px solid rgba(239, 68, 68, 0.8)',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0,0,0,0.8)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>💥</span> ACTION / THRILLER
                </div>

                {episodeText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 22px',
                      borderRadius: '8px',
                      background: epBgColor || 'linear-gradient(135deg, #ea580c 0%, #b45309 100%)',
                      color: epTextColor,
                      fontSize: `${episodeFontSize || 22}px`,
                      fontWeight: 900,
                      boxShadow: '0 0 25px rgba(234, 88, 12, 0.7)',
                      border: '1.5px solid rgba(251, 146, 60, 0.8)',
                    }}
                  >
                    🔥 {episodeText}
                  </div>
                )}
              </div>

              {/* Giant Explosive Action Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 68}px`,
                  fontWeight: 950,
                  lineHeight: '1.22',
                  margin: 0,
                  color: titleColor,
                  textShadow:
                    '0 0 35px rgba(220, 38, 38, 0.85), 0 4px 15px rgba(0, 0, 0, 1), 0 0 10px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                }}
              >
                {headerTitle}
              </h1>

              {/* Subheader with Dark Gunmetal Strip */}
              {subheader && (
                <div
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    borderLeft: '4px solid #ef4444',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    width: 'fit-content',
                    maxWidth: '100%',
                  }}
                >
                  <p
                    style={{
                      fontSize: `${subheaderFontSize || 24}px`,
                      fontWeight: 700,
                      color: subheaderColor,
                      margin: 0,
                      textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                      lineHeight: '1.35',
                    }}
                  >
                    {subheader}
                  </p>
                </div>
              )}

              {/* Author Badge */}
              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 22px',
                    borderRadius: '12px',
                    background: authorBgColor || 'rgba(24, 24, 27, 0.95)',
                    border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    width: 'fit-content',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>⚔️</span>
                  <span
                    style={{
                      fontSize: `${authorFontSize || 24}px`,
                      fontWeight: 800,
                      color: authorColor,
                    }}
                  >
                    {authorName}
                  </span>
                </div>
              )}
            </div>

            {/* Right Action Hero 3D Artwork (~42% width) */}
            <div
              style={{
                width: '42%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingRight: '45px',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  transform: 'perspective(1000px) rotateY(-12deg) rotateZ(1.5deg) scale(1.06)',
                  filter:
                    'drop-shadow(0 0 50px rgba(220, 38, 38, 0.65)) drop-shadow(0 30px 60px rgba(0,0,0,0.98))',
                  position: 'relative',
                }}
              >
                {renderCover(390, 530, {
                  border: '3px solid rgba(239, 68, 68, 0.6)',
                  boxShadow: '0 0 40px rgba(220,38,38,0.5)',
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
