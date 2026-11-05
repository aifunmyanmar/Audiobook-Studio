import React from 'react';
import { staticFile, useVideoConfig } from 'remotion';
import { AUDIOBOOK_THEMES, AUDIOBOOK_GRADIENT_PRESETS, AudiobookThemeId } from './types';
import { PresetRenderer } from './presets/PresetRenderer';
import {
  FeatherPenIcon,
  HeadphonesIcon,
  FlameIcon,
  StarIcon,
  ZapIcon,
  BookOpenIcon,
  CrownIcon,
  CheckCircleIcon,
  RadioIcon,
  SwordIcon,
} from './icons';

export type AudiobookThumbnailLayoutId =
  | 'layout-1-split'
  | 'layout-2-center'
  | 'layout-3-editorial'
  | 'layout-4-isometric'
  | 'layout-5-bold'
  | 'layout-6-action'
  | 'layout-7-neon-cyber'
  | 'layout-8-vintage-gold'
  | 'layout-9-floating-cards'
  | 'layout-10-podcast-cinematic'
  | 'layout-11-mystery-dark';

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
  {
    id: 'layout-7-neon-cyber',
    labelMm: 'နီယွန်ဆန်းပြား အနာဂတ်စတိုင်',
    labelEn: 'Neon Cyber Glow',
    descMm: 'နီယွန်အလင်းတန်း ဘောင်ကွပ် + အနာဂတ်ဆန်ဆန် 3D စာအုပ်နှင့် ဆွဲဆောင်မှုရှိသော အလင်းပြန်စာသား',
    badge: '7',
  },
  {
    id: 'layout-8-vintage-gold',
    labelMm: 'ဂန္ထဝင် ရွှေရောင်နန်းဆန်',
    labelEn: 'Royal Vintage Gold',
    descMm: 'ရွှေရောင်ပန်းခက် ထောင့်စွန်းများ + ရှေးဟောင်း သားရေကာဗာ + ခန့်ညားသော ရွှေရောင်စာသား',
    badge: '8',
  },
  {
    id: 'layout-9-floating-cards',
    labelMm: 'မျဉ်းစောင်းဒိုင်းနမစ် မျက်နှာနှစ်ခြမ်း',
    labelEn: 'Dynamic Diagonal Split',
    descMm: 'ထောင့်စောင်း အလင်းအမှောင် မျက်နှာပြင် + အလယ်မှ စောင်းထားသော ကာဗာနှင့် CTR အမြင့်ဆုံး စာလုံးကတ်',
    badge: '9',
  },
  {
    id: 'layout-10-podcast-cinematic',
    labelMm: 'ရုပ်ရှင်အဆင့် စတူဒီယို ဘရော့ကတ်',
    labelEn: 'Studio Masterclass Broadcast',
    descMm: 'အသံသွင်းစတူဒီယို နောက်ခံ + Verified အမှတ်တံဆိပ် + ညာဘက် မီးမောင်းထိုး စာအုပ်ကြီး',
    badge: '10',
  },
  {
    id: 'layout-11-mystery-dark',
    labelMm: 'လျှို့ဝှက်နက်နဲ သည်းထိတ်ရင်ဖို',
    labelEn: 'Dark Noir Mystery',
    descMm: 'မြူခိုးနက်နက်ထဲမှ ထွက်ပေါ်လာသော စာအုပ် + သွေးရောင်နှင့် အပြာရင့် လျှို့ဝှက်အလင်းတန်းများ',
    badge: '11',
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
            <BookOpenIcon size={44} color="#94a3b8" style={{ marginBottom: '12px' }} />
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
          overflow: 'hidden',
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
              inset: '36px 60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '45px',
              zIndex: 10,
              boxSizing: 'border-box',
            }}
          >
            {/* Left Cover Artwork */}
            <div style={{ transform: 'perspective(800px) rotateY(6deg)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))' }}>
              {renderCover(360, 490)}
            </div>

            {/* Right Information Container */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                maxHeight: '560px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '16px',
                padding: '28px 36px',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
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
                  <HeadphonesIcon size={16} color="#94a3b8" /> AUDIOBOOK SPECIAL
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

              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
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

              {subheader && (
                <p
                  style={{
                    fontSize: `${subheaderFontSize || 24}px`,
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

              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor} />
                  <span style={{ fontSize: `${authorFontSize || 22}px`, fontWeight: 700, color: authorColor }}>
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
              inset: '20px 60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: '680px',
            }}
          >
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '12px 24px',
                borderRadius: '22px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                maxHeight: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <h1
                style={{
                  fontSize: `${headerFontSize || 54}px`,
                  fontWeight: 900,
                  lineHeight: '1.25',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  maxHeight: '115px',
                  overflow: 'hidden',
                }}
              >
                {headerTitle}
              </h1>
              {subheader && (
                <p
                  style={{
                    fontSize: `${subheaderFontSize || 20}px`,
                    fontWeight: 600,
                    color: subheaderColor,
                    margin: '4px 0 0 0',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {subheader}
                </p>
              )}
            </div>

            <div
              style={{
                transform: 'perspective(900px) rotateX(4deg)',
                filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.9))',
                flexShrink: 0,
                margin: '8px 0',
              }}
            >
              {renderCover(280, 340)}
            </div>

            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {authorName ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 22px',
                    borderRadius: '999px',
                    background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor} />
                  <span style={{ fontSize: `${authorFontSize || 22}px`, fontWeight: 700, color: authorColor }}>
                    {authorName}
                  </span>
                </div>
              ) : <div />}

              {episodeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 32px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 24}px`,
                    fontWeight: 900,
                    boxShadow: `0 0 30px ${epBgColor}aa`,
                    border: '2px solid rgba(255,255,255,0.3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FlameIcon size={18} color={epTextColor} />
                  <span>{episodeText}</span>
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
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                padding: '50px 45px 50px 65px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '18px',
                background: 'linear-gradient(to right, rgba(15,23,42,0.98) 60%, rgba(15,23,42,0.7) 90%, transparent 100%)',
                zIndex: 2,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {episodeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 22px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 20}px`,
                    fontWeight: 800,
                    width: 'fit-content',
                    boxShadow: `0 0 20px ${epBgColor}88`,
                  }}
                >
                  <HeadphonesIcon size={16} color={epTextColor} />
                  <span>{episodeText}</span>
                </div>
              )}

              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
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
                <p style={{ fontSize: `${subheaderFontSize || 24}px`, fontWeight: 600, color: subheaderColor, margin: 0 }}>
                  {subheader}
                </p>
              )}

              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 22px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(30,41,59,0.9)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    width: 'fit-content',
                    marginTop: '6px',
                  }}
                >
                  <FeatherPenIcon size={20} color={authorColor} />
                  <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 700, color: authorColor }}>
                    {authorName}
                  </span>
                </div>
              )}
            </div>

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
              inset: '36px 60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '40px',
              zIndex: 10,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                transform: 'perspective(1000px) rotateY(-18deg) rotateX(8deg) scale(1.02)',
                filter: 'drop-shadow(25px 25px 35px rgba(0,0,0,0.85))',
                flexShrink: 0,
              }}
            >
              {renderCover(370, 500, {
                borderRight: '12px solid #334155',
                borderBottom: '8px solid #1e293b',
              })}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
                maxHeight: '560px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '32px',
                borderRadius: '30px',
                background: 'rgba(15, 23, 42, 0.90)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {episodeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 24px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 22}px`,
                    fontWeight: 900,
                    width: 'fit-content',
                    boxShadow: `0 0 25px ${epBgColor}99`,
                  }}
                >
                  <StarIcon size={16} color={epTextColor} />
                  <span>{episodeText}</span>
                  <StarIcon size={16} color={epTextColor} />
                </div>
              )}

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
                <p style={{ fontSize: `${subheaderFontSize || 22}px`, fontWeight: 600, color: subheaderColor, margin: 0 }}>
                  {subheader}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '8px',
                  padding: '8px 20px',
                  borderRadius: '16px',
                  background: authorBgColor || 'rgba(30,41,59,0.9)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  width: 'fit-content',
                }}
              >
                <FeatherPenIcon size={18} color={authorColor} />
                <span style={{ fontSize: `${authorFontSize || 22}px`, fontWeight: 700, color: authorColor }}>
                  {authorName}
                </span>
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
              inset: '24px 50px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 10,
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: '672px',
            }}
          >
            <div
              style={{
                width: '100%',
                padding: '16px 28px',
                borderRadius: '24px',
                background: 'linear-gradient(to right, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: `${headerFontSize || 58}px`,
                    fontWeight: 900,
                    lineHeight: '1.2',
                    margin: 0,
                    color: titleColor,
                    textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    maxHeight: '130px',
                    overflow: 'hidden',
                  }}
                >
                  {headerTitle}
                </h1>
                {subheader && (
                  <p
                    style={{
                      fontSize: `${subheaderFontSize || 20}px`,
                      fontWeight: 600,
                      color: subheaderColor,
                      margin: '4px 0 0 0',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {subheader}
                  </p>
                )}
              </div>

              {episodeText && (
                <div
                  style={{
                    padding: '12px 30px',
                    borderRadius: '999px',
                    background: epBgColor,
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 28}px`,
                    fontWeight: 900,
                    boxShadow: `0 0 35px ${epBgColor}bb`,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {episodeText}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '20px 28px',
                  borderRadius: '22px',
                  background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  maxWidth: '520px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
                  မြန်မာ အသံထွက်ဝတ္ထုရှည်
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FeatherPenIcon size={22} color={authorColor} />
                  <span style={{ fontSize: `${authorFontSize || 28}px`, fontWeight: 800, color: authorColor }}>
                    {authorName}
                  </span>
                </div>
              </div>

              <div style={{ transform: 'scale(0.95)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                {renderCover(290, 360)}
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

            <div
              style={{
                width: '56%',
                height: '100%',
                padding: '40px 30px 40px 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '14px',
                zIndex: 10,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                    border: '1.5px solid rgba(239, 68, 68, 0.8)',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0,0,0,0.8)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <ZapIcon size={15} color="#ffffff" />
                  <span>ACTION / THRILLER</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      background: epBgColor || 'linear-gradient(135deg, #ea580c 0%, #b45309 100%)',
                      color: epTextColor,
                      fontSize: `${episodeFontSize || 20}px`,
                      fontWeight: 900,
                      boxShadow: '0 0 25px rgba(234, 88, 12, 0.7)',
                      border: '1.5px solid rgba(251, 146, 60, 0.8)',
                    }}
                  >
                    <FlameIcon size={16} color={epTextColor} />
                    <span>{episodeText}</span>
                  </div>
                )}
              </div>

              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
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

              {subheader && (
                <div
                  style={{
                    padding: '8px 16px',
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
                      fontSize: `${subheaderFontSize || 22}px`,
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

              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    background: authorBgColor || 'rgba(24, 24, 27, 0.95)',
                    border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor} />
                  <span
                    style={{
                      fontSize: `${authorFontSize || 22}px`,
                      fontWeight: 800,
                      color: authorColor,
                    }}
                  >
                    {authorName}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                width: '44%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingRight: '40px',
                zIndex: 10,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  transform: 'perspective(1000px) rotateY(-12deg) rotateZ(1.5deg) scale(1.04)',
                  filter:
                    'drop-shadow(0 0 50px rgba(220, 38, 38, 0.65)) drop-shadow(0 30px 60px rgba(0,0,0,0.98))',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {renderCover(370, 500, {
                  border: '3px solid rgba(239, 68, 68, 0.6)',
                  boxShadow: '0 0 40px rgba(220,38,38,0.5)',
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 7: NEON CYBER GLOW (Futuristic Sci-Fi & Glowing Laser) */}
        {/* ======================================================== */}
        {layoutId === 'layout-7-neon-cyber' && (
          <div
            style={{
              position: 'absolute',
              inset: '24px 36px',
              borderRadius: '28px',
              border: '2px solid rgba(6, 182, 212, 0.65)',
              boxShadow: '0 0 35px rgba(6, 182, 212, 0.35), inset 0 0 35px rgba(168, 85, 247, 0.2)',
              background: 'radial-gradient(circle at 30% 50%, rgba(15, 23, 42, 0.94) 0%, rgba(3, 7, 18, 0.98) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '30px 48px',
              gap: '40px',
              zIndex: 10,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Left Hologram Floating Artwork */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  transform: 'perspective(1000px) rotateY(10deg) scale(1.03)',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(6, 182, 212, 0.5))',
                }}
              >
                {renderCover(340, 460, {
                  border: '2.5px solid #06b6d4',
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)',
                })}
              </div>
              {/* Futuristic Neon Reflection Halo */}
              <div
                style={{
                  width: '320px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(6, 182, 212, 0.7) 0%, transparent 75%)',
                  marginTop: '12px',
                  filter: 'blur(2px)',
                }}
              />
            </div>

            {/* Right Cyber Information Column */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '14px',
                zIndex: 10,
              }}
            >
              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 18px',
                    borderRadius: '999px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1.5px solid #06b6d4',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                    color: '#67e8f9',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                  }}
                >
                  <ZapIcon size={15} color="#06b6d4" />
                  <span>NEON CYBER EDITION</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 22px',
                      borderRadius: '999px',
                      background: epBgColor || 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      color: epTextColor,
                      fontSize: `${episodeFontSize || 20}px`,
                      fontWeight: 900,
                      boxShadow: '0 0 25px rgba(236, 72, 153, 0.6)',
                      border: '1.5px solid rgba(244, 114, 182, 0.8)',
                    }}
                  >
                    <FlameIcon size={16} color={epTextColor} />
                    <span>{episodeText}</span>
                  </div>
                )}
              </div>

              {/* Glowing Laser Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
                  fontWeight: 950,
                  lineHeight: '1.24',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 0 25px #06b6d4, 0 0 45px rgba(6, 182, 212, 0.6), 0 4px 15px rgba(0,0,0,1)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                }}
              >
                {headerTitle}
              </h1>

              {/* Futuristic Subtitle */}
              {subheader && (
                <div
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderLeft: '4px solid #06b6d4',
                    width: 'fit-content',
                    maxWidth: '100%',
                  }}
                >
                  <p
                    style={{
                      fontSize: `${subheaderFontSize || 22}px`,
                      fontWeight: 700,
                      color: subheaderColor,
                      margin: 0,
                      textShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
                      lineHeight: '1.35',
                    }}
                  >
                    {subheader}
                  </p>
                </div>
              )}

              {/* Cyber Author Capsule */}
              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 22px',
                    borderRadius: '999px',
                    background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                    border: '1.5px solid rgba(6, 182, 212, 0.5)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor || '#38bdf8'} />
                  <span style={{ fontSize: `${authorFontSize || 22}px`, fontWeight: 800, color: authorColor || '#38bdf8' }}>
                    {authorName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 8: ROYAL VINTAGE GOLD (Aristocratic Classic Literature) */}
        {/* ======================================================== */}
        {layoutId === 'layout-8-vintage-gold' && (
          <div
            style={{
              position: 'absolute',
              inset: '24px 36px',
              borderRadius: '26px',
              border: '2px solid rgba(245, 158, 11, 0.7)',
              boxShadow: '0 0 40px rgba(217, 119, 6, 0.35), inset 0 0 45px rgba(0, 0, 0, 0.85)',
              background: 'radial-gradient(circle at 45% 45%, #181005 0%, #0d0802 60%, #050301 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '30px 48px',
              gap: '45px',
              zIndex: 10,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Left Gold-Embossed 3D Book */}
            <div
              style={{
                transform: 'perspective(1000px) rotateY(-8deg) scale(1.03)',
                filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95)) drop-shadow(0 0 35px rgba(245, 158, 11, 0.45))',
                flexShrink: 0,
              }}
            >
              {renderCover(340, 480, {
                border: '3px solid #f59e0b',
                boxShadow: '0 0 35px rgba(245, 158, 11, 0.45)',
              })}
            </div>

            {/* Right Royal Column */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '15px',
                zIndex: 10,
              }}
            >
              {/* Royal Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
                    border: '1.5px solid #f59e0b',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                    color: '#fef08a',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                  }}
                >
                  <CrownIcon size={16} color="#f59e0b" />
                  <span>ROYAL MYANMAR CLASSIC</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 22px',
                      borderRadius: '8px',
                      background: epBgColor || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: epTextColor || '#1e1b4b',
                      fontSize: `${episodeFontSize || 22}px`,
                      fontWeight: 900,
                      boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)',
                      border: '1.5px solid #fef08a',
                    }}
                  >
                    <StarIcon size={15} color={epTextColor || '#1e1b4b'} />
                    <span>{episodeText}</span>
                  </div>
                )}
              </div>

              {/* Golden Embossed Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
                  fontWeight: 900,
                  lineHeight: '1.24',
                  margin: 0,
                  color: titleColor || '#fef08a',
                  textShadow: '0 4px 20px rgba(0,0,0,1), 0 0 30px rgba(245, 158, 11, 0.6)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                }}
              >
                {headerTitle}
              </h1>

              {/* Subtitle */}
              {subheader && (
                <p
                  style={{
                    fontSize: `${subheaderFontSize || 22}px`,
                    fontWeight: 600,
                    color: subheaderColor || '#fed7aa',
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                    lineHeight: '1.4',
                  }}
                >
                  {subheader}
                </p>
              )}

              {/* Author Wax-Seal Pill */}
              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 24px',
                    borderRadius: '12px',
                    background: authorBgColor || 'rgba(30, 20, 5, 0.95)',
                    border: '1.5px solid rgba(245, 158, 11, 0.6)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.8)',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor || '#fbbf24'} />
                  <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 800, color: authorColor || '#fbbf24' }}>
                    {authorName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 9: DYNAMIC DIAGONAL SPLIT (High-CTR Dual Block) */}
        {/* ======================================================== */}
        {layoutId === 'layout-9-floating-cards' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            {/* Diagonal Left Half: Deep Charcoal Black (60% diagonal partition) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'polygon(0 0, 62% 0, 48% 100%, 0 100%)',
                background: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
                zIndex: 1,
              }}
            />

            {/* Diagonal Right Half: Rich Vibrant Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 48% 100%)',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.85) 0%, rgba(185, 28, 28, 0.95) 100%)',
                zIndex: 1,
              }}
            />

            {/* Left Content Area (54%) */}
            <div
              style={{
                width: '54%',
                height: '100%',
                padding: '45px 35px 45px 65px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '16px',
                zIndex: 10,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 20px',
                  borderRadius: '999px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1.5px solid #ef4444',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  width: 'fit-content',
                }}
              >
                <FlameIcon size={16} color="#ef4444" />
                <span>HOT RELEASE AUDIOBOOK</span>
              </div>

              {/* Bold Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
                  fontWeight: 950,
                  lineHeight: '1.24',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 25px rgba(0,0,0,1)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                }}
              >
                {headerTitle}
              </h1>

              {/* Subheader */}
              {subheader && (
                <p style={{ fontSize: `${subheaderFontSize || 22}px`, fontWeight: 600, color: subheaderColor, margin: 0 }}>
                  {subheader}
                </p>
              )}

              {/* Author Capsule */}
              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor} />
                  <span style={{ fontSize: `${authorFontSize || 22}px`, fontWeight: 700, color: authorColor }}>
                    {authorName}
                  </span>
                </div>
              )}
            </div>

            {/* Right Tilted 3D Artwork (46%) */}
            <div
              style={{
                width: '46%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10,
                paddingRight: '30px',
              }}
            >
              {/* Floating Episode Badge */}
              {episodeText && (
                <div
                  style={{
                    position: 'absolute',
                    top: '45px',
                    right: '55px',
                    padding: '10px 28px',
                    borderRadius: '999px',
                    background: epBgColor || '#111827',
                    color: epTextColor,
                    fontSize: `${episodeFontSize || 24}px`,
                    fontWeight: 900,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    zIndex: 20,
                  }}
                >
                  {episodeText}
                </div>
              )}

              <div
                style={{
                  transform: 'perspective(1000px) rotateY(-14deg) rotateZ(2deg) scale(1.05)',
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.95))',
                }}
              >
                {renderCover(360, 490, {
                  border: '3px solid rgba(255,255,255,0.4)',
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 10: STUDIO MASTERCLASS (High-End Podcast Broadcast) */}
        {/* ======================================================== */}
        {layoutId === 'layout-10-podcast-cinematic' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 65px',
              gap: '40px',
              zIndex: 10,
              boxSizing: 'border-box',
              background: 'radial-gradient(circle at 75% 50%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.98) 75%)',
            }}
          >
            {/* Left Content Area (~55%) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '16px',
                zIndex: 10,
              }}
            >
              {/* Studio Masterclass Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: '1.5px solid #38bdf8',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                  }}
                >
                  <RadioIcon size={16} color="#ffffff" />
                  <span>STUDIO MASTERCLASS EDITION</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 22px',
                      borderRadius: '8px',
                      background: epBgColor || 'rgba(15, 23, 42, 0.90)',
                      color: epTextColor,
                      fontSize: `${episodeFontSize || 20}px`,
                      fontWeight: 900,
                      border: '1.5px solid #38bdf8',
                    }}
                  >
                    <HeadphonesIcon size={16} color={epTextColor} />
                    <span>{episodeText}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
                  fontWeight: 950,
                  lineHeight: '1.24',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                }}
              >
                {headerTitle}
              </h1>

              {/* Subheader */}
              {subheader && (
                <p style={{ fontSize: `${subheaderFontSize || 24}px`, fontWeight: 600, color: subheaderColor, margin: 0 }}>
                  {subheader}
                </p>
              )}

              {/* Verified Author Card */}
              {authorName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 24px',
                    borderRadius: '16px',
                    background: authorBgColor || 'rgba(15, 23, 42, 0.90)',
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
                    width: 'fit-content',
                    marginTop: '6px',
                  }}
                >
                  <FeatherPenIcon size={20} color={authorColor || '#38bdf8'} />
                  <span style={{ fontSize: `${authorFontSize || 24}px`, fontWeight: 800, color: authorColor || '#38bdf8' }}>
                    {authorName}
                  </span>
                  <CheckCircleIcon size={18} color="#38bdf8" />
                </div>
              )}
            </div>

            {/* Right Hero Artwork with Studio Spotlight Ring */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* Diffused Spotlight Halo */}
              <div
                style={{
                  position: 'absolute',
                  width: '460px',
                  height: '460px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{ transform: 'perspective(900px) rotateY(-6deg) scale(1.02)', filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.95))' }}>
                {renderCover(360, 490, {
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 0 40px rgba(56, 189, 248, 0.3)',
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYOUT 11: DARK NOIR MYSTERY (Crime, Suspense, Supernatural) */}
        {/* ======================================================== */}
        {layoutId === 'layout-11-mystery-dark' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              zIndex: 10,
              overflow: 'hidden',
              background: 'radial-gradient(circle at 35% 45%, #0d131f 0%, #060910 60%, #020306 100%)',
            }}
          >
            {/* Atmospheric Fog Vignette Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 30% 50%, rgba(14, 165, 233, 0.15) 0%, rgba(220, 38, 38, 0.12) 50%, rgba(2, 3, 6, 0.92) 85%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Left Cover Emerging from Mist (~44%) */}
            <div
              style={{
                width: '44%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: '50px',
                zIndex: 10,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  transform: 'perspective(1000px) rotateY(12deg) rotateZ(-1deg) scale(1.04)',
                  filter:
                    'drop-shadow(0 30px 60px rgba(0,0,0,0.98)) drop-shadow(0 0 40px rgba(220, 38, 38, 0.5))',
                }}
              >
                {renderCover(350, 480, {
                  border: '2.5px solid rgba(239, 68, 68, 0.6)',
                  boxShadow: '0 0 35px rgba(239, 68, 68, 0.4)',
                })}
              </div>
            </div>

            {/* Right Information Column (~56%) */}
            <div
              style={{
                width: '56%',
                height: '100%',
                padding: '45px 55px 45px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '16px',
                zIndex: 10,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                    border: '1.5px solid #ef4444',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                    color: '#fca5a5',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                  }}
                >
                  <SwordIcon size={16} color="#ef4444" />
                  <span>NOIR SUSPENSE / MYSTERY</span>
                </div>

                {episodeText && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 22px',
                      borderRadius: '8px',
                      background: epBgColor || '#991b1b',
                      color: epTextColor,
                      fontSize: `${episodeFontSize || 20}px`,
                      fontWeight: 900,
                      boxShadow: '0 0 25px rgba(220, 38, 38, 0.6)',
                      border: '1.5px solid #f87171',
                    }}
                  >
                    <FlameIcon size={16} color={epTextColor} />
                    <span>{episodeText}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: `${headerFontSize || 64}px`,
                  fontWeight: 950,
                  lineHeight: '1.24',
                  margin: 0,
                  color: titleColor,
                  textShadow: '0 0 30px rgba(220, 38, 38, 0.7), 0 4px 15px rgba(0,0,0,1)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  fontFamily: "'PannYeat', 'Padauk', sans-serif",
                }}
              >
                {headerTitle}
              </h1>

              {/* Subtitle */}
              {subheader && (
                <div
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    borderLeft: '4px solid #ef4444',
                    width: 'fit-content',
                    maxWidth: '100%',
                  }}
                >
                  <p
                    style={{
                      fontSize: `${subheaderFontSize || 22}px`,
                      fontWeight: 700,
                      color: subheaderColor,
                      margin: 0,
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
                    gap: '10px',
                    padding: '8px 22px',
                    borderRadius: '12px',
                    background: authorBgColor || 'rgba(24, 24, 27, 0.95)',
                    border: '1.5px solid rgba(239, 68, 68, 0.5)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}
                >
                  <FeatherPenIcon size={18} color={authorColor || '#fca5a5'} />
                  <span
                    style={{
                      fontSize: `${authorFontSize || 22}px`,
                      fontWeight: 800,
                      color: authorColor || '#fca5a5',
                    }}
                  >
                    {authorName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
