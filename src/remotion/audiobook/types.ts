export type AudiobookThemeId =
  | 'horror-halloween'
  | 'motivation-rays'
  | 'autumn-leaves'
  | 'cosmic-nebula'
  | 'mystic-fog'
  | 'floating-bubbles'
  | 'golden-embers'
  | 'vintage-candle'
  | 'custom-video';

export interface AudiobookThemeConfig {
  id: AudiobookThemeId;
  nameMm: string;
  nameEn: string;
  genreSuggestionMm: string;
  videoFile?: string;
  accentColor: string;
  secondaryColor: string;
  gradientBg: string;
  textColor: string;
}

export interface GradientPreset {
  id: string;
  nameMm: string;
  nameEn: string;
  gradient: string;
  accentColor: string;
  category: 'light' | 'dark';
}

export const AUDIOBOOK_GRADIENT_PRESETS: GradientPreset[] = [
  // --- 1. Light & Bright Presets (လင်းလက်ကြည်လင်) ---
  {
    id: 'bright-morning-gold',
    nameMm: 'နံနက်ခင်း ရွှေရောင်ဆန်း (Morning Sunlight & Gold)',
    nameEn: 'Morning Sunlight & Gold',
    gradient: 'radial-gradient(circle at 45% 35%, #fffbeb 0%, #fef3c7 45%, #fde68a 80%, #f59e0b 100%)',
    accentColor: '#d97706',
    category: 'light',
  },
  {
    id: 'bright-pastel-sky',
    nameMm: 'မိုးကောင်းကင် နုနုပြာ (Pastel Sky & White Pearl)',
    nameEn: 'Pastel Sky & White Pearl',
    gradient: 'radial-gradient(circle at 50% 30%, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 75%, #0284c7 100%)',
    accentColor: '#0284c7',
    category: 'light',
  },
  {
    id: 'bright-vintage-paper',
    nameMm: 'ရှေးဟောင်း ပေရွက်စက္ကူ (Parchment & Warm Sepia)',
    nameEn: 'Parchment & Warm Sepia',
    gradient: 'radial-gradient(circle at 40% 40%, #fefce8 0%, #fef9c3 40%, #fde047 80%, #ca8a04 100%)',
    accentColor: '#ca8a04',
    category: 'light',
  },
  {
    id: 'bright-rose-champagne',
    nameMm: 'နှင်းဆီနုနု ချစ်ခြင်းမေတ္တာ (Soft Rose & Champagne)',
    nameEn: 'Soft Rose & Champagne',
    gradient: 'radial-gradient(circle at 60% 30%, #fff1f2 0%, #ffe4e6 45%, #fecdd3 80%, #e11d48 100%)',
    accentColor: '#e11d48',
    category: 'light',
  },
  {
    id: 'bright-emerald-mist',
    nameMm: 'သစ်တောသစ်လွင် မြစိမ်းနု (Fresh Emerald & Mint)',
    nameEn: 'Fresh Emerald & Mint',
    gradient: 'radial-gradient(circle at 50% 30%, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 80%, #16a34a 100%)',
    accentColor: '#16a34a',
    category: 'light',
  },
  {
    id: 'bright-lavender-daylight',
    nameMm: 'ခရမ်းနုနု နံနက်ခင်း (Lavender Morning)',
    nameEn: 'Lavender Morning',
    gradient: 'radial-gradient(circle at 50% 40%, #faf5ff 0%, #f3e8ff 45%, #e9d5ff 80%, #9333ea 100%)',
    accentColor: '#9333ea',
    category: 'light',
  },

  // --- 2. Deep & Elegant Presets (ခန့်ညားနက်မှောင်) ---
  {
    id: 'obsidian-gold',
    nameMm: 'ရွှေဝါရောင်နှင့် အနက်ရောင် (Obsidian & Gold)',
    nameEn: 'Obsidian & Gold',
    gradient: 'radial-gradient(circle at 50% 40%, #2a1c06 0%, #140d02 60%, #070401 100%)',
    accentColor: '#f59e0b',
    category: 'dark',
  },
  {
    id: 'royal-purple',
    nameMm: 'နန်းဆန်သော ခရမ်းရောင် (Royal Purple & Indigo)',
    nameEn: 'Royal Purple & Indigo',
    gradient: 'radial-gradient(circle at 30% 30%, #1e1035 0%, #0d091e 50%, #05040a 100%)',
    accentColor: '#a855f7',
    category: 'dark',
  },
  {
    id: 'crimson-horror',
    nameMm: 'သွေးရောင်လဆန်း ထိတ်လန့်ဖွယ် (Blood Moon Horror)',
    nameEn: 'Blood Moon Horror',
    gradient: 'radial-gradient(circle at 50% 40%, #2b0408 0%, #160205 60%, #060002 100%)',
    accentColor: '#ef4444',
    category: 'dark',
  },
  {
    id: 'emerald-forest',
    nameMm: 'မြစိမ်းရောင် သစ်တော (Emerald Forest & Jade)',
    nameEn: 'Emerald Forest & Jade',
    gradient: 'radial-gradient(circle at 50% 50%, #051c14 0%, #020e0a 60%, #010403 100%)',
    accentColor: '#10b981',
    category: 'dark',
  },
  {
    id: 'ocean-abyss',
    nameMm: 'ပင်လယ်နက် အပြာရင့် (Deep Ocean Abyss)',
    nameEn: 'Deep Ocean Abyss',
    gradient: 'radial-gradient(circle at 70% 30%, #04242d 0%, #021217 55%, #010608 100%)',
    accentColor: '#06b6d4',
    category: 'dark',
  },
  {
    id: 'cosmic-black',
    nameMm: 'စကြဝဠာ အနက်ရောင်ပြေး (Cosmic Pure Dark)',
    nameEn: 'Cosmic Pure Dark',
    gradient: 'radial-gradient(circle at 40% 60%, #120a1f 0%, #08040d 60%, #020104 100%)',
    accentColor: '#8b5cf6',
    category: 'dark',
  },
];

export const AUDIOBOOK_THEMES: AudiobookThemeConfig[] = [
  {
    id: 'horror-halloween',
    nameMm: 'Halloween လပြည့်ညနှင့် သွေးရောင်လမင်း (Halloween Moon & Fog)',
    nameEn: 'Halloween Moon & Fog',
    genreSuggestionMm: 'သရဲတစ္ဆေ၊ သည်းထိတ်ရင်ဖို၊ ထူးဆန်းထွေလာ၊ စုန်းကဝေနှင့် လျှို့ဝှက်ဆန်းကြယ်',
    videoFile: 'backgrounds/loop_horror_halloween.mp4',
    accentColor: '#ef4444',
    secondaryColor: '#f97316',
    gradientBg: 'radial-gradient(circle at 50% 40%, #2b0408 0%, #160205 60%, #060002 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'motivation-rays',
    nameMm: 'ခွန်အားဖြစ်စေသော ရွှေရောင်အလင်းမှုန်များ (Motivation Golden Sparks)',
    nameEn: 'Motivation Golden Sparks',
    genreSuggestionMm: 'ဘဝခွန်အားဖြည့်၊ အောင်မြင်ရေး၊ စီးပွားရေး၊ စိတ်ဓာတ်ခွန်အားပေး စာအုပ်များ',
    videoFile: 'backgrounds/loop_motivation_gold.mp4',
    accentColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    gradientBg: 'radial-gradient(circle at 50% 30%, #2a1c06 0%, #140d02 60%, #070401 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'autumn-leaves',
    nameMm: 'ဆောင်းဦး သစ်ရွက်ကြွေ သဘာဝအလှ (Real Autumn Leaves Falling)',
    nameEn: 'Real Autumn Leaves',
    genreSuggestionMm: 'အချစ်ဝတ္ထု၊ အလွမ်းရသ၊ မြန်မာဂန္ထဝင် အနုပညာစာပေ၊ သဘာဝတရား',
    videoFile: 'backgrounds/loop_autumn_leaves.mp4',
    accentColor: '#f97316',
    secondaryColor: '#eab308',
    gradientBg: 'radial-gradient(circle at 60% 35%, #2a1608 0%, #170b04 55%, #080301 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'cosmic-nebula',
    nameMm: 'စကြဝဠာ ကြယ်စင်များနှင့် နဂါးငွေ့တန်း (Cosmic Stars in Space)',
    nameEn: 'Cosmic Stars & Space',
    genreSuggestionMm: 'သိပ္ပံစိတ်ကူးယဉ် (Sci-Fi)၊ စကြဝဠာရှာဖွေရေး၊ အနာဂတ်ကမ္ဘာ',
    videoFile: 'backgrounds/loop_cosmic_stars.mp4',
    accentColor: '#a855f7',
    secondaryColor: '#38bdf8',
    gradientBg: 'radial-gradient(circle at 50% 50%, #10062b 0%, #070314 60%, #020106 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'mystic-fog',
    nameMm: 'ဆန်းကြယ်သော မြူခိုးနှင့် လျှို့ဝှက်ချက် (Mystic Atmospheric Fog)',
    nameEn: 'Mystic Ethereal Fog',
    genreSuggestionMm: 'စုံထောက်၊ လျှို့ဝှက်သည်းဖို၊ ပဟေဠိ၊ အဂ္ဂိရတ်နှင့် နက်နဲသောဇာတ်လမ်းများ',
    videoFile: 'backgrounds/loop_mystic_fog.mp4',
    accentColor: '#2dd4bf',
    secondaryColor: '#06b6d4',
    gradientBg: 'radial-gradient(circle at 60% 40%, #061c24 0%, #030e12 60%, #010406 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'floating-bubbles',
    nameMm: 'အလင်းလွင့် အလှပူဖောင်းနှင့် ဘိုကေး (Luminous Optical Bokeh)',
    nameEn: 'Luminous Bokeh Orbs',
    genreSuggestionMm: 'အထွေထွေ ဝတ္ထုရှည်၊ လူငယ်ဘဝ၊ ခေတ်ပေါ်စာပေ၊ စိတ်ကူးယဉ်',
    videoFile: 'backgrounds/loop_bokeh_bubbles.mp4',
    accentColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    gradientBg: 'radial-gradient(circle at 40% 30%, #2b0e27 0%, #140512 60%, #060105 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'golden-embers',
    nameMm: 'မီးပွားနှင့် ရဲရဲတောက် လာဗာမီးတောက် (Intense Fire Embers)',
    nameEn: 'Intense Fiery Embers',
    genreSuggestionMm: 'စစ်ပွဲ၊ တိုက်ခိုက်ရေး၊ သူရဲကောင်း၊ အက်ရှင်နှင့် ရာဇဝင်သမိုင်း',
    videoFile: 'backgrounds/loop_golden_embers.mp4',
    accentColor: '#ef4444',
    secondaryColor: '#f97316',
    gradientBg: 'radial-gradient(circle at 50% 60%, #300c02 0%, #170501 60%, #070100 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'vintage-candle',
    nameMm: 'ဖယောင်းတိုင်မီးရောင် ရှေးဟောင်းရသ (Vintage Candlelight)',
    nameEn: 'Warm Vintage Candlelight',
    genreSuggestionMm: 'ရှေးဟောင်းသမိုင်း၊ ဂန္ထဝင်ဝတ္ထု၊ အလွမ်းအဆွေး၊ တရားဓမ္မ',
    videoFile: 'backgrounds/loop_vintage_candle.mp4',
    accentColor: '#d97706',
    secondaryColor: '#f59e0b',
    gradientBg: 'radial-gradient(circle at 50% 45%, #2a1608 0%, #160a03 60%, #070301 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'custom-video',
    nameMm: 'မိမိစိတ်ကြိုက် Video Loop ထည့်သွင်းရန် (Custom MP4 Loop)',
    nameEn: 'Custom MP4 Loop File',
    genreSuggestionMm: 'အင်တာနက် (Pexels, Pixabay စသည်) မှ မိမိဒေါင်းလုဒ်လုပ်ထားသော ဗီဒီယိုဖိုင်',
    accentColor: '#6366f1',
    secondaryColor: '#a855f7',
    gradientBg: 'radial-gradient(circle at 50% 50%, #111827 0%, #030712 100%)',
    textColor: '#ffffff',
  },
];

export type AudiobookVideoCompositionId =
  | 'video-comp-1-classic'
  | 'video-comp-2-center-stage'
  | 'video-comp-3-cinematic-wide'
  | 'video-comp-4-minimal-glass'
  | 'video-comp-5-isometric-vinyl'
  | 'video-comp-6-dramatic-broadcast';

export interface VideoCompositionOption {
  id: AudiobookVideoCompositionId;
  labelMm: string;
  labelEn: string;
  descMm: string;
  descEn: string;
  badge: string;
}

export const VIDEO_COMPOSITION_OPTIONS: VideoCompositionOption[] = [
  {
    id: 'video-comp-1-classic',
    labelMm: 'Classic Studio Split (လက်ရှိ မူလ)',
    labelEn: 'Classic Studio Split (Default)',
    descMm: 'ဘယ်ဘက် 3D စာအုပ်ကာဗာ + ညာဘက် ခေါင်းစီး၊ စာရေးသူနှင့် အသံလှိုင်း Visualizer',
    descEn: 'Left 3D book cover with right-side glass typography & audio waveform.',
    badge: '1',
  },
  {
    id: 'video-comp-2-center-stage',
    labelMm: 'Center Stage Spotlight (အလယ်ဗဟို အထူးပြု)',
    labelEn: 'Center Stage Spotlight',
    descMm: 'အလယ်ဗဟို စာအုပ်ကာဗာကြီး + အထက်ခေါင်းစီး + အောက်ခြေ အသံလှိုင်း အပြည့်',
    descEn: 'Prominent center artwork spotlight framed by top marquee & wide equalizer.',
    badge: '2',
  },
  {
    id: 'video-comp-3-cinematic-wide',
    labelMm: 'Cinematic Full-Bleed (ရုပ်ရှင်ဆန်ဆန် ညာဘက်ကာဗာ)',
    labelEn: 'Cinematic Full-Bleed Hero',
    descMm: 'ညာဘက်အပြည့် ကာဗာရုပ်ရှင်ဆန်ဆန် ပြသမှု + ဘယ်ဘက် ခမ်းနားသော စာသားနှင့် အသံလှိုင်း',
    descEn: 'Right-side wide artwork bleed with left-side bold typography & soundwave.',
    badge: '3',
  },
  {
    id: 'video-comp-4-minimal-glass',
    labelMm: 'Minimalist Studio Glass (ခေတ်မီ အောက်ခြေဘား)',
    labelEn: 'Minimalist Studio Glass',
    descMm: 'အောက်ခြေ floating မှန်ကြည်ဘားတွင် ကာဗာအသေး၊ စာသားနှင့် အသံလှိုင်းပြသမှု',
    descEn: 'Floating bottom frosted glass bar allowing maximum background video immersion.',
    badge: '4',
  },
  {
    id: 'video-comp-5-isometric-vinyl',
    labelMm: 'Isometric Vinyl Album (စောင်း 3D စာအုပ်နှင့် အသံခွေ)',
    labelEn: 'Isometric Modern Album',
    descMm: 'စောင်းထားသော 3D စာအုပ် + အနုပညာ အသံလှိုင်း စက်ဝိုင်း visualizer',
    descEn: 'Angled 3D book cover paired with acoustic pulse rings & sharp typography.',
    badge: '5',
  },
  {
    id: 'video-comp-6-dramatic-broadcast',
    labelMm: 'Dramatic Broadcast (သည်းထိတ်ရင်ဖို ဘရော့ကတ်)',
    labelEn: 'Dramatic Broadcast & Thriller',
    descMm: 'အပေါ် header bar + ပြင်းထန်သော အလင်းရောင်ခြည်၊ စာလုံးထူနှင့် dual visualizer',
    descEn: 'High-contrast broadcast ribbon, glowing accents, and dual equalizer meters.',
    badge: '6',
  },
];

export interface AudiobookProps {
  headerTitle: string;
  subheader?: string;
  authorName?: string;
  episodeText?: string;
  headerFontSize?: number;
  subheaderFontSize?: number;
  authorFontSize?: number;
  episodeFontSize?: number;
  artworkUrl?: string;
  artworkShape?: 'book-cover' | 'circle' | 'square';
  artworkWidth?: number;
  logoUrl?: string;
  logoSize?: number;
  audioUrl?: string;
  bgVideoUrl?: string;
  themeId?: AudiobookThemeId;
  gradientId?: string;
  customGradient?: string;
  loopDurationFrames?: number;
  headerTextColor?: string;
  subheaderTextColor?: string;
  authorTextColor?: string;
  authorBgColor?: string;
  episodeTextColor?: string;
  episodeBgColor?: string;
  videoCompositionId?: AudiobookVideoCompositionId;
}
