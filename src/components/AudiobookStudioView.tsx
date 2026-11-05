import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Player } from '@remotion/player';
import { AudiobookComposition } from '../remotion/audiobook/AudiobookComposition';
import {
  AudiobookThumbnailComposition,
  AudiobookThumbnailLayoutId,
  THUMBNAIL_LAYOUT_OPTIONS,
} from '../remotion/audiobook/AudiobookThumbnailComposition';
import { AUDIOBOOK_THEMES, AUDIOBOOK_GRADIENT_PRESETS, AudiobookThemeId } from '../remotion/audiobook/types';
import { DhammaStudioView } from './DhammaStudioView';
import {
  Flower2,
  BookOpen,
  Circle,
  Square,
  Sparkles,
  Headphones,
  Music,
  Image as ImageIcon,
  FolderOpen,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Type,
  Palette,
  Sliders,
  Video as VideoIcon,
  Sun,
  Moon,
  Mic,
  Copy,
  RotateCcw,
  Check,
  HelpCircle,
  Loader2,
  Youtube,
  Wand2,
  RefreshCw,
  Key,
  Folder,
  Play,
  ListOrdered,
  History,
  Trash2,
  Film,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

interface AudiobookStudioViewProps {
  onBackToHome?: () => void;
}

export interface CustomBackgroundPreset {
  id: string;
  nameMm: string;
  nameEn: string;
  genreSuggestionMm?: string;
  videoUrl: string;
  localPath?: string;
  fileSizeBytes?: number;
  durationSec?: number;
  createdAt: number;
}

export const COVER_ART_STYLE_OPTIONS = [
  { id: 'anime', label: 'Anime Style', desc: 'Japanese Anime / Manga Cover' },
  { id: '2d-sketch', label: '2D Sketch', desc: 'Pencil & Ink Hand-Drawn Sketch' },
  { id: '3d-animation', label: '3D Animation', desc: 'Pixar / Disney 3D Character Art' },
  { id: 'funny-art', label: 'Caricature Art', desc: 'Expressive Humorous Comic Art' },
  { id: 'horror', label: 'Dark Gothic', desc: 'Horror, Mystery & Dark Fantasy' },
  { id: 'realistic', label: 'Photorealistic', desc: 'Cinematic High-Detail Realism' },
  { id: 'auto', label: 'Auto Detect', desc: 'AI chooses from title & audio context' },
];

const AUDIOBOOK_SETTINGS_KEY = 'equiz_audiobook_studio_settings_v3';

interface SavedAudiobookSettings {
  headerTitle?: string;
  subheader?: string;
  authorName?: string;
  episodeText?: string;
  headerFontSize?: number;
  subheaderFontSize?: number;
  authorFontSize?: number;
  episodeFontSize?: number;
  artworkWidth?: number;
  artworkShape?: 'book-cover' | 'circle' | 'square';
  artworkPathInput?: string;
  artworkUrl?: string;
  logoPathInput?: string;
  logoUrl?: string;
  audioPathInput?: string;
  selectedGradientId?: string;
  selectedThemeId?: AudiobookThemeId;
  gradientCategory?: 'all' | 'light' | 'dark';
  resolution?: '1080p' | '2k';
  webAudioUrlInput?: string;
  geminiApiKey?: string;
  coverArtStyle?: string;
  headerTextColor?: string;
  subheaderTextColor?: string;
  authorTextColor?: string;
  authorBgColor?: string;
  episodeTextColor?: string;
  episodeBgColor?: string;
  bgVideoUrl?: string;
  generatedAnimeResult?: {
    imageUrl: string;
    imagePath: string;
    animePrompt: string;
    storySummaryMm: string;
    genre: string;
  } | null;
}

const getInitialSettings = (): SavedAudiobookSettings => {
  try {
    const raw = localStorage.getItem(AUDIOBOOK_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const AudiobookStudioView: React.FC<AudiobookStudioViewProps> = ({ onBackToHome }) => {
  const initialSettings = useMemo(() => getInitialSettings(), []);

  // Studio Tab Switcher State: 'audiobook' | 'dhamma'
  const [activeStudioTab, setActiveStudioTab] = useState<'audiobook' | 'dhamma'>('audiobook');

  // 1. Typography states (restored from auto-saved localStorage)
  const [headerTitle, setHeaderTitle] = useState<string>(initialSettings.headerTitle ?? 'The Silent Melody');
  const [subheader, setSubheader] = useState<string>(initialSettings.subheader ?? 'A Compelling Audio Masterpiece');
  const [authorName, setAuthorName] = useState<string>(initialSettings.authorName ?? 'Daw Khin Swe Oo');
  const [episodeText, setEpisodeText] = useState<string>(initialSettings.episodeText ?? 'Complete Edition');

  // Resolution state (1080p Full HD vs 2K QHD 1440p)
  const [resolution, setResolution] = useState<'1080p' | '2k'>(initialSettings.resolution ?? '1080p');

  // Sliders for dynamic custom sizing for ALL text & artwork
  const [headerFontSize, setHeaderFontSize] = useState<number>(initialSettings.headerFontSize ?? 72);
  const [subheaderFontSize, setSubheaderFontSize] = useState<number>(initialSettings.subheaderFontSize ?? 32);
  const [authorFontSize, setAuthorFontSize] = useState<number>(initialSettings.authorFontSize ?? 24);
  const [episodeFontSize, setEpisodeFontSize] = useState<number>(initialSettings.episodeFontSize ?? 18);
  const [artworkWidth, setArtworkWidth] = useState<number>(initialSettings.artworkWidth ?? 420);

  // 2. Artwork (Single Image Slot) states
  const [artworkUrl, setArtworkUrl] = useState<string>(initialSettings.artworkUrl ?? '');
  const [artworkPathInput, setArtworkPathInput] = useState<string>(initialSettings.artworkPathInput ?? '');
  const [artworkShape, setArtworkShape] = useState<'book-cover' | 'circle' | 'square'>(initialSettings.artworkShape ?? 'book-cover');
  const artworkFileInputRef = useRef<HTMLInputElement>(null);

  // 2B. AI Anime Artwork states
  const [isGeneratingAnimeCover, setIsGeneratingAnimeCover] = useState<boolean>(false);
  const [animeCoverError, setAnimeCoverError] = useState<string | null>(null);
  const [animePromptInput, setAnimePromptInput] = useState<string>('');
  const [generatedAnimeResult, setGeneratedAnimeResult] = useState<{
    imageUrl: string;
    imagePath: string;
    animePrompt: string;
    storySummaryMm: string;
    genre: string;
  } | null>(initialSettings.generatedAnimeResult ?? null);
  const [animeGenStep, setAnimeGenStep] = useState<string>('');
  const [activeImageModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('equiz_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.imageModel) return parsed.imageModel.trim();
      }
    } catch {}
    return 'gemini-nano-banana-2.1';
  });

  // 3. Brand Logo states
  const [logoUrl, setLogoUrl] = useState<string>(initialSettings.logoUrl ?? '');
  const [logoPathInput, setLogoPathInput] = useState<string>(initialSettings.logoPathInput ?? '');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // 4. Audio states
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioPathInput, setAudioPathInput] = useState<string>(initialSettings.audioPathInput ?? '');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioDurationSec, setAudioDurationSec] = useState<number>(0);
  const [isInspectingAudio, setIsInspectingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAudio, setIsDraggingAudio] = useState<boolean>(false);
  const [showVoiceMemoHelp, setShowVoiceMemoHelp] = useState<boolean>(false);
  const [copiedVoicePath, setCopiedVoicePath] = useState<boolean>(false);

  // 4B. YouTube & Web Audio states
  const [audioInputMode, setAudioInputMode] = useState<'local' | 'link'>('local');
  const [webAudioUrlInput, setWebAudioUrlInput] = useState<string>(initialSettings.webAudioUrlInput ?? '');
  const [isDownloadingWebAudio, setIsDownloadingWebAudio] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Gemini API Key & Style States
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('equiz_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey) return parsed.apiKey.trim();
      }
    } catch {}
    return initialSettings.geminiApiKey ?? '';
  });
  const [apiKeyInputValue, setApiKeyInputValue] = useState<string>(geminiApiKey);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [coverArtStyle, setCoverArtStyle] = useState<string>(initialSettings.coverArtStyle ?? 'auto');

  // 5. Background Palette & Real Video Preset
  const [selectedGradientId, setSelectedGradientId] = useState<string>(initialSettings.selectedGradientId ?? 'bright-morning-gold');
  const [gradientCategory, setGradientCategory] = useState<'all' | 'light' | 'dark'>(initialSettings.gradientCategory ?? 'all');
  const [selectedThemeId, setSelectedThemeId] = useState<AudiobookThemeId>(initialSettings.selectedThemeId ?? 'horror-halloween');

  // Color Customization states (Title, Subheader, Author, Episode badges)
  const [headerTextColor, setHeaderTextColor] = useState<string>(initialSettings.headerTextColor ?? '');
  const [subheaderTextColor, setSubheaderTextColor] = useState<string>(initialSettings.subheaderTextColor ?? '');
  const [authorTextColor, setAuthorTextColor] = useState<string>(initialSettings.authorTextColor ?? '');
  const [authorBgColor, setAuthorBgColor] = useState<string>(initialSettings.authorBgColor ?? '');
  const [episodeTextColor, setEpisodeTextColor] = useState<string>(initialSettings.episodeTextColor ?? '');
  const [episodeBgColor, setEpisodeBgColor] = useState<string>(initialSettings.episodeBgColor ?? '');

  // Custom Video Loop states
  const [bgVideoUrl, setBgVideoUrl] = useState<string>(initialSettings.bgVideoUrl ?? '');
  const [bgVideoPathInput, setBgVideoPathInput] = useState<string>('');
  const bgVideoFileInputRef = useRef<HTMLInputElement>(null);
  const [stockVideoUrlInput, setStockVideoUrlInput] = useState<string>('');
  const [isDownloadingStockVideo, setIsDownloadingStockVideo] = useState<boolean>(false);
  const [stockVideoError, setStockVideoError] = useState<string | null>(null);
  const [stockVideoSuccess, setStockVideoSuccess] = useState<string | null>(null);
  const [customBgPresets, setCustomBgPresets] = useState<CustomBackgroundPreset[]>([]);

  // 6. Render & Exporting states
interface AudiobookQueueItem {
  id: string;
  headerTitle: string;
  subheader?: string;
  authorName?: string;
  episodeText?: string;
  resolution: '1080p' | '2k';
  audioFilePath: string;
  audioFileName?: string;
  audioDurationSec?: number;
  artworkUrl?: string;
  artworkShape?: string;
  artworkWidth?: number;
  logoUrl?: string;
  bgVideoUrl?: string;
  themeId: string;
  gradientId?: string;
  customGradient?: string;
  headerTextColor?: string;
  subheaderTextColor?: string;
  authorTextColor?: string;
  authorBgColor?: string;
  episodeTextColor?: string;
  episodeBgColor?: string;
  headerFontSize?: number;
  subheaderFontSize?: number;
  authorFontSize?: number;
  episodeFontSize?: number;
  status: 'pending' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  statusMessage: string;
  outputPath?: string | null;
  localFilePath?: string | null;
  downloadUrl?: string | null;
  fileSizeBytes?: number;
  error?: string | null;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  logs: string[];
}

  const [renderError, setRenderError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Batch Render Queue & History states
  const [activeJob, setActiveJob] = useState<AudiobookQueueItem | null>(null);
  const [queueJobs, setQueueJobs] = useState<AudiobookQueueItem[]>([]);
  const [historyJobs, setHistoryJobs] = useState<AudiobookQueueItem[]>([]);
  const [queueTab, setQueueTab] = useState<'queue' | 'history'>('queue');
  const [queueToast, setQueueToast] = useState<string | null>(null);
  const [isUploadingArtwork, setIsUploadingArtwork] = useState<boolean>(false);

  // Section Accordion Drawer States (Collapsible drawers to optimize vertical space)
  const [expandedSections, setExpandedSections] = useState<{
    audio: boolean;
    artwork: boolean;
    typography: boolean;
    thumbnail: boolean;
    videoPresets: boolean;
    gradients: boolean;
  }>({
    audio: true,
    artwork: true,
    typography: true,
    thumbnail: true,
    videoPresets: false, // Collapsed by default as requested
    gradients: false, // Collapsed by default as requested
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Cover Art Style Selector Dropdown State
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);

  // YouTube Thumbnail Studio States
  const [selectedThumbnailLayout, setSelectedThumbnailLayout] = useState<AudiobookThumbnailLayoutId>('layout-1-split');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(false);
  const [thumbnailToast, setThumbnailToast] = useState<{
    status: 'idle' | 'generating' | 'success' | 'error';
    message?: string;
    filePath?: string;
    fileName?: string;
    downloadUrl?: string;
  } | null>(null);
  const [activePreviewMode, setActivePreviewMode] = useState<'video' | 'thumbnail'>('video');
  const [folderOpenFeedback, setFolderOpenFeedback] = useState<string | null>(null);

  // Dedicated Thumbnail Custom Typography & Color Overrides
  const [useCustomThumbStyles, setUseCustomThumbStyles] = useState<boolean>(false);
  const [thumbHeaderFontSize, setThumbHeaderFontSize] = useState<number>(68);
  const [thumbSubheaderFontSize, setThumbSubheaderFontSize] = useState<number>(24);
  const [thumbAuthorFontSize, setThumbAuthorFontSize] = useState<number>(24);
  const [thumbEpisodeFontSize, setThumbEpisodeFontSize] = useState<number>(24);
  const [thumbHeaderTextColor, setThumbHeaderTextColor] = useState<string>('');
  const [thumbSubheaderTextColor, setThumbSubheaderTextColor] = useState<string>('');
  const [thumbAuthorTextColor, setThumbAuthorTextColor] = useState<string>('');
  const [thumbAuthorBgColor, setThumbAuthorBgColor] = useState<string>('');
  const [thumbEpisodeTextColor, setThumbEpisodeTextColor] = useState<string>('');
  const [thumbEpisodeBgColor, setThumbEpisodeBgColor] = useState<string>('');

  const handleSyncThumbStylesFromVideo = () => {
    setThumbHeaderFontSize(headerFontSize);
    setThumbSubheaderFontSize(subheaderFontSize);
    setThumbAuthorFontSize(authorFontSize);
    setThumbEpisodeFontSize(episodeFontSize);
    setThumbHeaderTextColor(headerTextColor);
    setThumbSubheaderTextColor(subheaderTextColor);
    setThumbAuthorTextColor(authorTextColor);
    setThumbAuthorBgColor(authorBgColor);
    setThumbEpisodeTextColor(episodeTextColor);
    setThumbEpisodeBgColor(episodeBgColor);
    setUseCustomThumbStyles(true);
  };

  // Active theme metadata
  const currentTheme = useMemo(() => {
    return AUDIOBOOK_THEMES.find((t) => t.id === selectedThemeId) || AUDIOBOOK_THEMES[0];
  }, [selectedThemeId]);

  // Filtered gradients by light/dark category
  const filteredGradients = useMemo(() => {
    if (gradientCategory === 'all') return AUDIOBOOK_GRADIENT_PRESETS;
    return AUDIOBOOK_GRADIENT_PRESETS.filter((g) => g.category === gradientCategory);
  }, [gradientCategory]);

  // Auto-Save Effect: saves any modification to localStorage immediately
  useEffect(() => {
    try {
      const dataToSave: SavedAudiobookSettings = {
        headerTitle,
        subheader,
        authorName,
        episodeText,
        headerFontSize,
        subheaderFontSize,
        authorFontSize,
        episodeFontSize,
        artworkWidth,
        artworkShape,
        artworkPathInput,
        // Avoid saving giant base64 or blob URLs to localStorage (prevent quota crash)
        artworkUrl: (artworkUrl.startsWith('data:') || artworkUrl.startsWith('blob:')) ? '' : artworkUrl,
        logoPathInput,
        logoUrl: (logoUrl.startsWith('data:') || logoUrl.startsWith('blob:')) ? '' : logoUrl,
        audioPathInput: (audioPathInput.startsWith('data:') || audioPathInput.startsWith('blob:')) ? '' : audioPathInput,
        selectedGradientId,
        selectedThemeId,
        gradientCategory,
        resolution,
        headerTextColor,
        subheaderTextColor,
        authorTextColor,
        authorBgColor,
        episodeTextColor,
        episodeBgColor,
        bgVideoUrl,
        generatedAnimeResult,
        webAudioUrlInput,
        geminiApiKey,
        coverArtStyle,
      };
      localStorage.setItem(AUDIOBOOK_SETTINGS_KEY, JSON.stringify(dataToSave));
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.warn('Failed to auto-save audiobook studio settings to localStorage:', e);
    }
  }, [
    headerTitle,
    subheader,
    authorName,
    episodeText,
    headerFontSize,
    subheaderFontSize,
    authorFontSize,
    episodeFontSize,
    artworkWidth,
    artworkShape,
    artworkPathInput,
    artworkUrl,
    logoPathInput,
    logoUrl,
    audioPathInput,
    selectedGradientId,
    selectedThemeId,
    gradientCategory,
    resolution,
    generatedAnimeResult,
    webAudioUrlInput,
    geminiApiKey,
    coverArtStyle,
  ]);

  // Auto-inspect audio path from saved settings on mount
  useEffect(() => {
    if (initialSettings.audioPathInput && initialSettings.audioPathInput.trim() && !initialSettings.audioPathInput.startsWith('data:')) {
      inspectAudioPath(initialSettings.audioPathInput);
    }
  }, []);

  // Inspect audio path via backend ffprobe
  const inspectAudioPath = async (rawPath: string) => {
    if (!rawPath || !rawPath.trim()) return;
    setIsInspectingAudio(true);
    setAudioError(null);
    try {
      const res = await fetch('/api/audiobook/inspect-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: rawPath.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAudioError(data.error || 'Audio file could not be verified (file not found or invalid format)');
        return;
      }
      setAudioDurationSec(data.durationSec);
      setAudioFileName(data.fileName);
      setAudioUrl(data.streamUrl);
      setAudioPathInput(data.filePath);
    } catch (err: any) {
      setAudioError(err?.message || 'Server error inspecting audio');
    } finally {
      setIsInspectingAudio(false);
    }
  };

  // Helper to load audio from File object (via browse or drag-and-drop)
  const loadAudioFromFile = async (file: File) => {
    setAudioFileName(file.name);
    setAudioError(null);
    setIsInspectingAudio(true);
    setGeneratedAnimeResult(null);
    setAnimePromptInput('');

    // Suggest clean title from file name
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (cleanTitle) {
      setHeaderTitle(cleanTitle);
    }

    // 1. Instant local blob URL for immediate responsive playback preview
    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);

    // 2. Client-side audio element detection as early preview
    const tempAudio = new Audio();
    tempAudio.preload = 'metadata';
    tempAudio.src = localUrl;
    tempAudio.onloadedmetadata = () => {
      if (isFinite(tempAudio.duration) && tempAudio.duration > 0) {
        setAudioDurationSec(Math.round(tempAudio.duration));
      }
    };

    // 3. Upload directly to local server for 100% accurate ffprobe duration & stream URL
    try {
      const uploadRes = await fetch(`/api/audiobook/upload-audio?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await uploadRes.json();
      if (data.success) {
        setAudioDurationSec(data.durationSec);
        setAudioFileName(data.fileName);
        setAudioPathInput(data.filePath);
        setAudioUrl(data.streamUrl);
      }
    } catch (err) {
      console.warn('Backend audio upload failed, using local browser object:', err);
    } finally {
      setIsInspectingAudio(false);
    }
  };

  // Audio file selection via browser file picker
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadAudioFromFile(file);
  };

  // Artwork image selection via file picker (Instant preview + auto-uploaded for permanent persistence)
  const handleArtworkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setArtworkUrl(previewUrl);
    setArtworkPathInput(file.name);
    setIsUploadingArtwork(true);

    // 2. Upload file to server so it receives a permanent static URL and survives refreshes
    try {
      const res = await fetch(`/api/audiobook/upload-artwork?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setArtworkUrl(data.url);
        setArtworkPathInput(data.url);
      }
    } catch (err) {
      console.warn('Artwork upload failed, keeping local preview:', err);
    } finally {
      setIsUploadingArtwork(false);
    }
  };

  // Logo image selection via file picker
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoUrl(previewUrl);
    setLogoPathInput(file.name);

    try {
      const res = await fetch(`/api/audiobook/upload-artwork?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setLogoUrl(data.url);
        setLogoPathInput(data.url);
      }
    } catch (err) {
      console.warn('Logo upload failed, keeping local preview:', err);
    }
  };

  // Custom Video Loop selection via file picker (Uploads & auto-converts to 20s Ping-Pong Loop)
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setBgVideoUrl(objectUrl);
    setBgVideoPathInput(file.name);
    setSelectedThemeId('custom-video');

    // Upload to local server to auto-generate 20s seamless forward+reverse loop
    setIsDownloadingStockVideo(true);
    setStockVideoError(null);
    setStockVideoSuccess(null);
    try {
      const res = await fetch(`/api/audiobook/upload-video?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.success && data.videoUrl) {
        if (data.presets && Array.isArray(data.presets)) {
          setCustomBgPresets(data.presets);
        }
        setBgVideoUrl(data.videoUrl);
        setBgVideoPathInput(data.videoUrl);
        setStockVideoSuccess('Video processed into a 20s seamless ping-pong loop and saved as preset!');
      }
    } catch (err: any) {
      console.warn('Video upload ping-pong conversion failed, keeping preview:', err);
    } finally {
      setIsDownloadingStockVideo(false);
    }
  };

  // Apply manual Mac file path
  const handleApplyAudioPath = () => {
    if (!audioPathInput.trim()) return;
    setGeneratedAnimeResult(null);
    setAnimePromptInput('');
    inspectAudioPath(audioPathInput);
  };

  const handleApplyArtworkPath = async () => {
    const pathVal = artworkPathInput.trim();
    if (!pathVal) return;

    // If local Mac filesystem path (starts with / and not already served via /downloads/ or /backgrounds/)
    if (pathVal.startsWith('/') && !pathVal.startsWith('/downloads/') && !pathVal.startsWith('/backgrounds/')) {
      try {
        const res = await fetch('/api/audiobook/copy-local-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: pathVal }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setArtworkUrl(data.url);
          setArtworkPathInput(data.url);
          return;
        }
      } catch (e) {
        console.warn('Failed to copy local image:', e);
      }
    }
    setArtworkUrl(pathVal);
  };

  const handleApplyLogoPath = async () => {
    const pathVal = logoPathInput.trim();
    if (!pathVal) return;

    if (pathVal.startsWith('/') && !pathVal.startsWith('/downloads/') && !pathVal.startsWith('/backgrounds/')) {
      try {
        const res = await fetch('/api/audiobook/copy-local-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: pathVal }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setLogoUrl(data.url);
          setLogoPathInput(data.url);
          return;
        }
      } catch (e) {
        console.warn('Failed to copy local logo:', e);
      }
    }
    setLogoUrl(pathVal);
  };

  const handleApplyVideoPath = () => {
    if (!bgVideoPathInput.trim()) return;
    setBgVideoUrl(bgVideoPathInput.trim());
    setSelectedThemeId('custom-video');
  };

  // Fetch user-saved custom background video presets
  const fetchCustomBgPresets = useCallback(async () => {
    try {
      const res = await fetch('/api/audiobook/background-presets');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.presets)) {
        setCustomBgPresets(data.presets);
      }
    } catch {}
  }, []);

  // Delete a custom background preset
  const handleDeleteCustomBgPreset = async (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/audiobook/background-presets?id=${encodeURIComponent(presetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.presets)) {
        setCustomBgPresets(data.presets);
      }
    } catch {}
  };

  // Download Stock Video from Pexels, Pixabay, or direct URL
  const handleDownloadStockVideo = async () => {
    if (!stockVideoUrlInput.trim()) return;
    setIsDownloadingStockVideo(true);
    setStockVideoError(null);
    setStockVideoSuccess(null);
    try {
      const res = await fetch('/api/audiobook/download-video-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: stockVideoUrlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Video download failed');
      }
      if (data.presets && Array.isArray(data.presets)) {
        setCustomBgPresets(data.presets);
      }
      setBgVideoUrl(data.videoUrl);
      setBgVideoPathInput(data.videoUrl);
      setSelectedThemeId('custom-video');
      setStockVideoSuccess(`Download complete (${data.width}x${data.height}, ${data.durationSec}s). Saved as preset and applied as active motion loop!`);
    } catch (err: any) {
      setStockVideoError(err.message || 'Video download failed');
    } finally {
      setIsDownloadingStockVideo(false);
    }
  };

  // Save Gemini API Key locally
  const handleSaveApiKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    setGeminiApiKey(trimmed);
    try {
      const saved = localStorage.getItem('equiz_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.apiKey = trimmed;
      localStorage.setItem('equiz_settings', JSON.stringify(parsed));
    } catch {}
    setShowApiKeyInput(false);
  };

  // Download audio directly from YouTube or Web Link
  const handleDownloadWebAudio = async () => {
    if (!webAudioUrlInput.trim()) return;
    setIsDownloadingWebAudio(true);
    setDownloadError(null);
    setDownloadSuccessMsg(null);
    try {
      const res = await fetch('/api/audiobook/download-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webAudioUrlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to download audio from link');
      }
      setAudioDurationSec(data.durationSec);
      setAudioFileName(data.title || data.fileName);
      setAudioPathInput(data.filePath);
      setAudioUrl(data.streamUrl);

      if (data.fromCache) {
        setDownloadSuccessMsg(`Using cached download: ${data.title} (${data.formattedDuration})`);
      } else {
        setDownloadSuccessMsg(`Download complete: ${data.title} (${data.formattedDuration})`);
      }

      // Keep user's manual title intact (do not auto-overwrite headerTitle with YouTube title)
      // Reset previous AI cover result so old images do not persist
      setGeneratedAnimeResult(null);
      setAnimePromptInput('');
    } catch (err: any) {
      setDownloadError(err.message || 'Error downloading audio from link');
    } finally {
      setIsDownloadingWebAudio(false);
    }
  };

  // Generate AI Anime/Book Cover from Audio
  const handleGenerateAnimeArtwork = async () => {
    const effectiveKey = (geminiApiKey || '').trim();
    if (!effectiveKey || effectiveKey.length < 8) {
      setShowApiKeyInput(true);
      setAnimeCoverError('Please provide a Gemini API Key to enable AI audio analysis.');
      return;
    }

    setIsGeneratingAnimeCover(true);
    setAnimeCoverError(null);
    setAnimeGenStep('Extracting 15m audio sample with FFmpeg...');

    try {
      const res = await fetch('/api/audiobook/generate-anime-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioPath: audioPathInput || audioUrl,
          audioFileName,
          headerTitle,
          authorName,
          customPrompt: animePromptInput.trim(),
          apiKey: effectiveKey,
          imageModel: activeImageModel,
          artStyle: coverArtStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate anime artwork');
      }

      setGeneratedAnimeResult({
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        animePrompt: data.animePrompt,
        storySummaryMm: data.storySummaryMm,
        genre: data.genre,
      });

      // Auto-apply to preview
      setArtworkUrl(data.imageUrl);
      setArtworkPathInput(data.imagePath);
      setArtworkShape('book-cover');
    } catch (err: any) {
      setAnimeCoverError(err.message || 'Artwork generation failed');
    } finally {
      setIsGeneratingAnimeCover(false);
      setAnimeGenStep('');
    }
  };

  const handleApplyGeneratedAnime = () => {
    if (!generatedAnimeResult) return;
    setArtworkUrl(generatedAnimeResult.imageUrl);
    setArtworkPathInput(generatedAnimeResult.imagePath);
    setArtworkShape('book-cover');
  };

  const handleCopyVoiceMemoPath = () => {
    const voicePath = '~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings';
    navigator.clipboard.writeText(voicePath);
    setCopiedVoicePath(true);
    setTimeout(() => setCopiedVoicePath(false), 2500);
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all values to default template?')) return;
    localStorage.removeItem(AUDIOBOOK_SETTINGS_KEY);
    setHeaderTitle('The Silent Melody');
    setSubheader('A Compelling Audio Masterpiece');
    setAuthorName('Daw Khin Swe Oo');
    setEpisodeText('Complete Edition');
    setHeaderFontSize(72);
    setSubheaderFontSize(32);
    setAuthorFontSize(24);
    setEpisodeFontSize(18);
    setArtworkWidth(420);
    setArtworkShape('book-cover');
    setSelectedGradientId('bright-morning-gold');
    setSelectedThemeId('horror-halloween');
    setGradientCategory('all');
  };

  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remaining = Math.floor(sec % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
    }
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  // Fetch Queue & History Status
  const fetchQueueStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/audiobook/queue-status');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setActiveJob((prev) => {
          const nextVal = data.activeJob || null;
          return JSON.stringify(prev) === JSON.stringify(nextVal) ? prev : nextVal;
        });
        setQueueJobs((prev) => {
          const nextVal = data.queue || [];
          return JSON.stringify(prev) === JSON.stringify(nextVal) ? prev : nextVal;
        });
        setHistoryJobs((prev) => {
          const nextVal = data.history || [];
          return JSON.stringify(prev) === JSON.stringify(nextVal) ? prev : nextVal;
        });
      }
    } catch {
      // Ignore background network jitter
    }
  }, []);

  // Continuous background poller (1s during rendering, 1.5s idle) and preset initializer
  useEffect(() => {
    fetchQueueStatus();
    fetchCustomBgPresets();
    const pollInterval = activeJob ? 1000 : 1500;
    const interval = setInterval(fetchQueueStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchQueueStatus, fetchCustomBgPresets, activeJob]);

  // Auto-scroll logs to bottom as new live logs arrive
  const logsEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeJob?.logs?.length]);

  // Queue or Start Fast Render (Sequential FIFO background queue)
  const handleQueueOrStartRender = async () => {
    if (!headerTitle.trim()) {
      setRenderError('Please provide a Book Title before rendering.');
      return;
    }
    if (!audioPathInput && !audioUrl) {
      setRenderError('Please select an Audio Source before rendering.');
      return;
    }

    setRenderError(null);

    const payload = {
      headerTitle,
      subheader,
      authorName,
      episodeText,
      headerFontSize,
      subheaderFontSize,
      authorFontSize,
      episodeFontSize,
      artworkUrl: artworkUrl || artworkPathInput,
      artworkShape,
      artworkWidth,
      logoUrl: logoUrl || logoPathInput,
      audioFilePath: audioPathInput || audioUrl,
      audioPathOrBase64: audioPathInput || audioUrl,
      audioFileName: audioFileName || '',
      audioDurationSec: audioDurationSec || 0,
      bgVideoUrl: bgVideoUrl || bgVideoPathInput,
      themeId: selectedThemeId,
      gradientId: selectedGradientId,
      resolution,
      headerTextColor,
      subheaderTextColor,
      authorTextColor,
      authorBgColor,
      episodeTextColor,
      episodeBgColor,
    };

    try {
      const response = await fetch('/api/audiobook/queue-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json().catch(() => ({}));
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to start queue job');
      }

      const queuePos = resJson.queuePosition;
      setQueueToast(
        queuePos > 1 || activeJob
          ? `Added "${headerTitle}" to Queue #${queuePos}. You can prepare more audiobooks.`
          : `Starting export for "${headerTitle}"...`
      );
      setTimeout(() => setQueueToast(null), 6000);
      fetchQueueStatus();
    } catch (err: any) {
      setRenderError(err.message || 'Render failed');
    }
  };

  // Cancel pending job from queue
  const handleCancelQueueItem = async (jobId: string) => {
    try {
      await fetch('/api/audiobook/cancel-queue-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      fetchQueueStatus();
    } catch (e) {
      console.error('Failed to cancel job:', e);
    }
  };

  // Clear completed history item or all history
  const handleClearHistory = async (jobId?: string) => {
    try {
      await fetch('/api/audiobook/clear-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      fetchQueueStatus();
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  // Open completed job file in macOS Finder
  const handleOpenJobInFinder = async (filePath?: string | null) => {
    if (!filePath) return;
    try {
      await fetch('/api/audiobook/open-in-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
    } catch (e) {}
  };

  // Play completed job file directly in QuickTime
  const handlePlayJobVideo = async (filePath?: string | null) => {
    if (!filePath) return;
    try {
      await fetch('/api/audiobook/play-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
    } catch (e) {}
  };

  // Open designated Audiobook download folders in macOS Finder
  const handleOpenAudiobookFolder = async (folderType: 'audiobook' | 'thumbnails' | 'youtube' | 'ai' | 'bg') => {
    try {
      const res = await fetch('/api/audiobook/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderType }),
      });
      const data = await res.json();
      if (data.folderPath) {
        setFolderOpenFeedback(`Opened Finder: ${data.folderPath}`);
        setTimeout(() => setFolderOpenFeedback(null), 3500);
      }
    } catch (e) {
      console.error('Failed to open folder:', e);
    }
  };

  // Generate & Save ultra-crisp 1080p Full HD (1920x1080) PNG YouTube Thumbnail
  const handleGenerateThumbnail = async () => {
    setIsGeneratingThumbnail(true);
    setThumbnailToast({
      status: 'generating',
      message: 'Generating 1080p Full HD YouTube Thumbnail PNG...',
    });
    try {
      const payload = {
        layoutId: selectedThumbnailLayout,
        headerTitle,
        subheader,
        authorName,
        episodeText,
        headerFontSize: useCustomThumbStyles ? thumbHeaderFontSize : undefined,
        subheaderFontSize: useCustomThumbStyles ? thumbSubheaderFontSize : undefined,
        authorFontSize: useCustomThumbStyles ? thumbAuthorFontSize : undefined,
        episodeFontSize: useCustomThumbStyles ? thumbEpisodeFontSize : undefined,
        artworkUrl,
        artworkShape,
        themeId: selectedThemeId,
        gradientId: selectedGradientId,
        bgVideoUrl,
        headerTextColor: (useCustomThumbStyles && thumbHeaderTextColor) ? thumbHeaderTextColor : headerTextColor,
        subheaderTextColor: (useCustomThumbStyles && thumbSubheaderTextColor) ? thumbSubheaderTextColor : subheaderTextColor,
        authorTextColor: (useCustomThumbStyles && thumbAuthorTextColor) ? thumbAuthorTextColor : authorTextColor,
        authorBgColor: (useCustomThumbStyles && thumbAuthorBgColor) ? thumbAuthorBgColor : authorBgColor,
        episodeTextColor: (useCustomThumbStyles && thumbEpisodeTextColor) ? thumbEpisodeTextColor : episodeTextColor,
        episodeBgColor: (useCustomThumbStyles && thumbEpisodeBgColor) ? thumbEpisodeBgColor : episodeBgColor,
      };
      const res = await fetch('/api/audiobook/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to render thumbnail');
      }
      setThumbnailToast({
        status: 'success',
        message: 'YouTube Thumbnail (1080p Full HD) generated successfully!',
        filePath: data.localFilePath,
        fileName: data.filename || data.fileName,
        downloadUrl: data.downloadUrl,
      });
    } catch (err: any) {
      setThumbnailToast({
        status: 'error',
        message: err.message || 'Error occurred while generating thumbnail',
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // If Dhamma Studio tab is selected, render Dhamma Studio Suite with top switcher
  if (activeStudioTab === 'dhamma') {
    return (
      <div
        className="max-w-[1720px] mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in font-pann-yeat"
        style={{ fontFamily: "'PannYeat', 'Padauk', sans-serif" }}
      >
        {/* Top Header Bar with Studio Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Studio Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveStudioTab('audiobook')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
              >
                <Headphones className="w-4 h-4 text-indigo-400" />
                <span>Audiobook Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStudioTab('dhamma')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/30 transition-all"
              >
                <Flower2 className="w-4 h-4 text-slate-950" />
                <span>Dhamma Studio</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/20 text-slate-950 font-black">
                  New
                </span>
              </button>
            </div>
          </div>
        </div>

        <DhammaStudioView onSwitchToAudiobook={() => setActiveStudioTab('audiobook')} />
      </div>
    );
  }

  return (
    <div
      className="max-w-[1720px] mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in font-pann-yeat"
      style={{ fontFamily: "'PannYeat', 'Padauk', sans-serif" }}
    >
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-4">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Studio Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveStudioTab('audiobook')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Headphones className="w-4 h-4 text-amber-300" />
              <span>Audiobook Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStudioTab('dhamma')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-amber-300 transition-all"
            >
              <Flower2 className="w-4 h-4 text-amber-400" />
              <span>Dhamma Studio</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                New
              </span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Audiobook Studio Pro
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  {resolution.toUpperCase()} FHD
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous forward stream with seamless 20s ambient background loop
            </p>
          </div>
        </div>

        {/* Action Buttons & Auto-Save Status */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {lastSavedTime && (
            <span
              className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-medium"
              title="Settings auto-saved to local storage"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Auto-saved ({lastSavedTime})
            </span>
          )}

          <button
            onClick={handleResetDefaults}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Reset all settings to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Resolution Selector: 1080p FHD vs 2K QHD */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl p-1 gap-1 shadow-md">
            <button
              type="button"
              onClick={() => setResolution('1080p')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                resolution === '1080p'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1080p FHD
            </button>
            <button
              type="button"
              onClick={() => setResolution('2k')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                resolution === '2k'
                  ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-200" />
              2K QHD
            </button>
          </div>

          <button
            onClick={handleQueueOrStartRender}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            {activeJob ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Queue ({queueJobs.length + 1})</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Start Fast Export ({resolution.toUpperCase()} MP4)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Finder Folders Bar & 48h Cleanup Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1.5 shrink-0 mr-1">
            <Folder className="w-4 h-4 text-indigo-400" />
            <span>Downloads Folder:</span>
          </span>
          <button
            type="button"
            onClick={() => handleOpenAudiobookFolder('audiobook')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/80 transition-all flex items-center gap-1.5 shadow-sm font-medium"
            title="Open ~/Downloads/Audiobook/ in Finder"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" /><span>All Audiobooks</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAudiobookFolder('thumbnails')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 shadow-sm font-medium"
            title="Open ~/Downloads/Audiobook/Thumbnails/ in Finder"
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-400" /><span>Thumbnails</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAudiobookFolder('youtube')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-red-300 border border-red-500/30 transition-all flex items-center gap-1.5 shadow-sm font-medium"
            title="Open ~/Downloads/Audiobook/YouTube Downloads/ in Finder"
          >
            <Music className="w-3.5 h-3.5 text-red-400" /><span>YouTube Audio</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAudiobookFolder('ai')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 shadow-sm font-medium"
            title="Open ~/Downloads/Audiobook/AI Generations/ in Finder"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /><span>AI Covers</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAudiobookFolder('bg')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm font-medium"
            title="Open ~/Downloads/Audiobook/BG Videos/ (Permanent) in Finder"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" /><span>BG Videos</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-medium"
            title="Auto-cleans temporary render files older than 48 hours (excluding BG Videos)"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>48h Auto-Cleanup Active</span>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
              BG Videos Safe
            </span>
          </span>
        </div>
      </div>

      {folderOpenFeedback && (
        <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{folderOpenFeedback}</span>
        </div>
      )}

      {/* Render Error Alert (Top) */}
      {renderError && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-2xl animate-shake">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-semibold">{renderError}</span>
          </div>
          <button
            onClick={() => setRenderError(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Queue Toast Alert */}
      {queueToast && (
        <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{queueToast}</span>
          </div>
          <button
            onClick={() => setQueueToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Controls (Form) vs Right Live Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Form Controls (col-span-5) - Independent Scrollbar & Overscroll Contain */}
        <div className="lg:col-span-5 min-w-0 space-y-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-3 custom-scrollbar overscroll-contain">
          
          {/* 1. Audio Source Card with Drag & Drop & Apple Voice Memos Helper */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingAudio(true);
            }}
            onDragLeave={() => setIsDraggingAudio(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingAudio(false);
              const file = e.dataTransfer.files?.[0];
              if (file) loadAudioFromFile(file);
            }}
            className={`p-5 rounded-3xl bg-slate-900/80 border space-y-4 shadow-xl transition-all ${
              isDraggingAudio
                ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-400 scale-[1.01]'
                : 'border-slate-800'
            }`}
          >
            {/* Audio Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('audio')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block truncate">
                    1. Audio Source & Track
                  </span>
                  {audioDurationSec > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Duration: {formatDuration(audioDurationSec)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 max-w-[130px] truncate hidden sm:inline">
                  {audioFileName || 'No audio chosen'}
                </span>
                {expandedSections.audio ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.audio && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">

            {/* Audio Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAudioInputMode('local')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  audioInputMode === 'local'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Local File / Finder</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioInputMode('link')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  audioInputMode === 'link'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-200" />
                <span>YouTube / Web Link</span>
              </button>
            </div>

            {/* TAB 1: Local File & Apple Voice Memos Mode */}
            {audioInputMode === 'local' && (
              <>
                {/* 1-Click Instant Loader for Desktop Voice Memo */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2 truncate">
                        <span>Voice Memo on Desktop:</span>
                        <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">32:25</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate font-mono">
                        Lexber Drive 2 4 copy.m4a
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioPathInput('/Users/macbookair/Desktop/Lexber Drive 2 4 copy.m4a');
                      inspectAudioPath('/Users/macbookair/Desktop/Lexber Drive 2 4 copy.m4a');
                      setHeaderTitle('Lexber Drive 2 4');
                      setGeneratedAnimeResult(null);
                      setAnimePromptInput('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>1-Click Load</span>
                  </button>
                </div>

                {/* Apple Voice Memos Helper Banner */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span>How to import Apple Voice Memos</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVoiceMemoHelp(!showVoiceMemoHelp)}
                      className="text-[11px] text-amber-400 hover:text-amber-200 underline font-semibold flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {showVoiceMemoHelp ? 'Hide Help' : 'Show Help'}
                    </button>
                  </div>

                  {showVoiceMemoHelp && (
                    <div className="pt-2 text-[11px] text-slate-300 space-y-2 border-t border-amber-500/20 leading-relaxed">
                      <p>
                        <strong className="text-amber-300 font-bold">Method 1 (Easiest):</strong> Drag & drop recordings directly from the{' '}
                        <span className="text-white font-bold underline">Apple Voice Memos App</span> into the drop box below!
                      </p>
                      <p>
                        <strong className="text-amber-300 font-bold">Method 2:</strong> In Voice Memos, choose "Share" &gt; "Save to Files", save to Desktop or Downloads, then click Browse.
                      </p>
                      <div className="pt-1">
                        <span className="text-slate-400">Method 3 (Direct Recordings Folder Path):</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value="~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings"
                            className="flex-1 px-2.5 py-1 text-[10px] bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleCopyVoiceMemoPath}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            {copiedVoicePath ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedVoicePath ? 'Copied!' : 'Copy Path'}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Tip: In Finder, press <code className="text-amber-300 font-mono font-bold">Shift + Cmd + G</code>, paste this path, and press Enter to open recordings.</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Browser File Upload Button & Drop Target */}
                <input
                  type="file"
                  ref={audioFileInputRef}
                  onChange={handleAudioFileChange}
                  accept="audio/*"
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-slate-800 hover:from-indigo-800/60 border border-indigo-500/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <FolderOpen className="w-4 h-4 text-indigo-400" />
                    Browse Audio File...
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyAudioPath}
                    disabled={isInspectingAudio}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isInspectingAudio ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Check className="w-4 h-4 text-amber-400" />}
                    {isInspectingAudio ? 'Checking...' : 'Apply Path'}
                  </button>
                </div>

                {/* Manual Path or Selected File Display */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                    <span>Local File Location Path or Drag & Drop File:</span>
                    {isInspectingAudio && (
                      <span className="text-[11px] text-amber-400 font-normal flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Inspecting file...
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={audioPathInput}
                      onChange={(e) => setAudioPathInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyAudioPath();
                        }
                      }}
                      placeholder="/Users/macbookair/Desktop/Lexber Drive 2 4 copy.m4a"
                      className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyAudioPath}
                      disabled={isInspectingAudio}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 flex-shrink-0"
                    >
                      {isInspectingAudio ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Inspecting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: YouTube & Direct Web Audio Link Mode */}
            {audioInputMode === 'link' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-red-950/20 border border-red-500/25">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-400" />
                    Enter YouTube or Direct Audio Link
                  </span>
                  <span className="text-[10px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                    Instant Audio Download
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webAudioUrlInput}
                      onChange={(e) => setWebAudioUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDownloadWebAudio();
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=... or direct audio URL"
                      className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-red-500/30 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-red-400"
                    />
                    <button
                      type="button"
                      onClick={handleDownloadWebAudio}
                      disabled={isDownloadingWebAudio || !webAudioUrlInput.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 flex-shrink-0 shadow-lg shadow-red-900/30"
                    >
                      {isDownloadingWebAudio ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading audio...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download & Apply</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-red-400 shrink-0" />
                    <span>Paste a YouTube link to extract audio track, title, and duration automatically.</span>
                  </p>
                </div>

                {downloadError && (
                  <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                    <span>{downloadError}</span>
                  </div>
                )}

                {downloadSuccessMsg && (
                  <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                    <span>{downloadSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Global Audio Status (Visible in both tabs) */}
            <div className="space-y-1.5">

              {audioError && (
                <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                  <span>{audioError}</span>
                </div>
              )}

              {audioFileName && !audioError && (
                <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Loaded: {audioFileName}</span>
                  </div>
                  <span className="bg-emerald-500/20 px-2.5 py-0.5 rounded-lg text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30 flex-shrink-0 ml-2 shadow-sm">
                    {formatDuration(audioDurationSec)}
                  </span>
                </div>
              )}
            </div>
            </div>
            )}
          </div>

          {/* 2. Single Artwork Card (Book Cover, Author Photo, or AI Scene) */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            {/* Artwork Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('artwork')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-300 block truncate">
                    2. Book Cover Artwork & Frame
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Featured single image slot
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 max-w-[130px] truncate hidden sm:inline">
                  {artworkUrl ? 'Cover Ready' : 'No Cover'}
                </span>
                {expandedSections.artwork ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.artwork && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">

            {/* Shape Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'book-cover', label: 'Book (3:4)', icon: BookOpen },
                { id: 'circle', label: 'Circle Avatar', icon: Circle },
                { id: 'square', label: 'Square (1:1)', icon: Square },
              ].map((s) => {
                const ShapeIcon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setArtworkShape(s.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all truncate text-center flex items-center justify-center gap-1.5 ${
                      artworkShape === s.id
                        ? 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <ShapeIcon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Artwork Card Width Slider */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-pink-400" />
                  Artwork Width / Scale:
                </span>
                <span className="font-mono text-pink-400 font-bold">{artworkWidth}px</span>
              </div>
              <input
                type="range"
                min={280}
                max={620}
                step={5}
                value={artworkWidth}
                onChange={(e) => setArtworkWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>280px (Compact)</span>
                <span>420px (Standard)</span>
                <span>620px (Large)</span>
              </div>
            </div>

            {/* AI Book Cover Generator Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-pink-950/40 border border-indigo-500/30 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-200">
                    AI Book Cover Generator (3:4 Ratio)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-lg border border-pink-500/30">
                    Model: {activeImageModel}
                  </span>
                </div>
              </div>

              {/* Gemini API Key Connection Banner */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300">Gemini API Key:</span>
                    {geminiApiKey && geminiApiKey.length > 8 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected (15m Audio Analysis)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Not Configured
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-[10px] text-amber-400 hover:text-amber-200 underline font-semibold"
                  >
                    {showApiKeyInput ? 'Close' : geminiApiKey ? 'Change Key' : 'Add Key'}
                  </button>
                </div>

                {showApiKeyInput && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-800">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKeyInputValue}
                        onChange={(e) => setApiKeyInputValue(e.target.value)}
                        placeholder="Enter Gemini API Key (AIzaSy...)"
                        className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-amber-500/40 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveApiKey(apiKeyInputValue)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>A Gemini API Key enables AI to listen to a 15-minute sample to craft authentic book covers.</span>
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Gemini AI analyzes a 15-minute audio sample to accurately detect characters, era, setting, and story mood for authentic artwork.
              </p>

              {/* Cover Art Style Selector (Collapsible Dropdown Menu) */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                  <span>Cover Artwork Style:</span>
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">
                    {COVER_ART_STYLE_OPTIONS.find(o => o.id === coverArtStyle)?.label || coverArtStyle}
                  </span>
                </label>

                {/* Dropdown Menu Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 text-left flex items-center justify-between transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-white">
                      {COVER_ART_STYLE_OPTIONS.find(o => o.id === coverArtStyle)?.label || coverArtStyle}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                      ({COVER_ART_STYLE_OPTIONS.find(o => o.id === coverArtStyle)?.desc || ''})
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${isStyleDropdownOpen ? 'rotate-180 text-indigo-300' : ''}`} />
                </button>

                {/* Collapsible Dropdown List */}
                {isStyleDropdownOpen && (
                  <div className="p-1.5 bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar animate-fade-in z-20">
                    {COVER_ART_STYLE_OPTIONS.map((st) => {
                      const isSelected = coverArtStyle === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setCoverArtStyle(st.id);
                            setIsStyleDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-xs font-bold block">{st.label}</span>
                            <span className={`text-[10px] truncate block ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {st.desc}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Optional Custom Theme/Keyword Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-medium">
                  Custom Character, Mood or Style Details (Optional):
                </label>
                <input
                  type="text"
                  value={animePromptInput}
                  onChange={(e) => setAnimePromptInput(e.target.value)}
                  placeholder="e.g. vintage character, military uniform, peaceful monastery, rain atmosphere..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-950/90 border border-indigo-500/30 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateAnimeArtwork}
                disabled={isGeneratingAnimeCover}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-60"
              >
                {isGeneratingAnimeCover ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{animeGenStep || 'Generating AI Cover Art...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate AI Cover Art from Audio</span>
                  </>
                )}
              </button>

              {animeCoverError && (
                <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                  <span>{animeCoverError}</span>
                </div>
              )}

              {/* Generated Anime Result Preview */}
              {generatedAnimeResult && (
                <div className="p-3 bg-slate-950/90 rounded-2xl border border-indigo-500/40 space-y-2.5 mt-2">
                  <div className="flex gap-3 items-center">
                    <img
                      src={generatedAnimeResult.imageUrl}
                      alt="AI Anime Cover"
                      className="w-20 h-28 object-cover rounded-xl border border-indigo-400/50 shadow-md shadow-indigo-950 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                          {generatedAnimeResult.genre || 'Anime Fiction'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 3:4 Generated
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 font-medium leading-snug line-clamp-2">
                        {generatedAnimeResult.storySummaryMm}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate italic">
                        {generatedAnimeResult.animePrompt}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleApplyGeneratedAnime}
                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply as Cover
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAnimeArtwork}
                      disabled={isGeneratingAnimeCover}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 border border-slate-700 transition-all"
                    >
                      <RefreshCw className="w-3 h-3 text-pink-400" />
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Image Selection Section */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                Or Upload from Computer / Direct Image URL:
              </span>

              {/* Image input buttons */}
              <input
                type="file"
                ref={artworkFileInputRef}
                onChange={handleArtworkFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => artworkFileInputRef.current?.click()}
                  disabled={isUploadingArtwork}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 disabled:opacity-50"
                >
                  {isUploadingArtwork ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                      Uploading Image...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-3.5 h-3.5 text-pink-400" />
                      Browse Image...
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleApplyArtworkPath}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  Apply Path
                </button>
              </div>

              {/* Manual Path or Base64 status */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={artworkPathInput}
                  onChange={(e) => {
                    setArtworkPathInput(e.target.value);
                    setArtworkUrl(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyArtworkPath()}
                  placeholder="/path/to/cover.jpg or https://..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono focus:outline-none focus:border-pink-500"
                />
                {artworkUrl && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Image Loaded Successfully
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setArtworkUrl('');
                        setArtworkPathInput('');
                      }}
                      className="text-slate-400 hover:text-rose-400 flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
            )}
          </div>

          {/* 3. Typography Card: Full Font Size Sliders for ALL Text Elements */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            {/* Typography Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('typography')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Type className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block truncate">
                    3. Book Details & Typography
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Title, Author, Font Sizes & Colors
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 max-w-[130px] truncate hidden sm:inline">
                  {headerTitle || 'No Title'}
                </span>
                {expandedSections.typography ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.typography && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                {/* Header Title Input (Supports 1 or 2 lines) */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
                    <span>Book Title (Header Title)</span>
                    <span className="text-[10px] text-amber-400 font-normal">Press Enter for multi-line title</span>
                  </label>
                  <textarea
                    rows={2}
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    placeholder="e.g. The Silent Melody (or press Enter for 2 lines)"
                    className="w-full px-3.5 py-2.5 text-base bg-slate-950 border border-slate-800 rounded-xl text-white font-pann-yeat focus:outline-none focus:border-indigo-500 font-bold shadow-inner resize-none leading-snug"
                  />
                </div>

            {/* Header Font Size Slider */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">1. Book Title Font Size:</span>
                <span className="font-mono text-indigo-400 font-bold">{headerFontSize}px</span>
              </div>
              <input
                type="range"
                min={36}
                max={160}
                step={2}
                value={headerFontSize}
                onChange={(e) => setHeaderFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>36px</span>
                <span>72px (Default)</span>
                <span>160px (Max)</span>
              </div>
            </div>

            {/* Subheader Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
                <span>Book Subtitle (Subheader)</span>
                <span className="text-[10px] text-amber-400 font-normal">Font: PannYeat</span>
              </label>
              <input
                type="text"
                value={subheader}
                onChange={(e) => setSubheader(e.target.value)}
                placeholder="e.g. A Compelling Audio Novel Masterpiece"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-pann-yeat"
              />
            </div>

            {/* Subheader Font Size Slider */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">2. Subheader Font Size:</span>
                <span className="font-mono text-indigo-400 font-bold">{subheaderFontSize}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={90}
                step={1}
                value={subheaderFontSize}
                onChange={(e) => setSubheaderFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>16px</span>
                <span>32px (Default)</span>
                <span>90px (Max)</span>
              </div>
            </div>

            {/* Author & Episode in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Daw Khin Swe Oo"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-pann-yeat focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">
                  Episode / Part
                </label>
                <input
                  type="text"
                  value={episodeText}
                  onChange={(e) => setEpisodeText(e.target.value)}
                  placeholder="e.g. Complete Edition / Part 1"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-pann-yeat focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Author Font Size Slider */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">3. Author Font Size:</span>
                <span className="font-mono text-indigo-400 font-bold">{authorFontSize}px</span>
              </div>
              <input
                type="range"
                min={14}
                max={70}
                step={1}
                value={authorFontSize}
                onChange={(e) => setAuthorFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>14px</span>
                <span>24px (Default)</span>
                <span>70px (Max)</span>
              </div>
            </div>

            {/* Episode Tag Font Size Slider */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">4. Episode Badge Size:</span>
                <span className="font-mono text-indigo-400 font-bold">{episodeFontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={50}
                step={1}
                value={episodeFontSize}
                onChange={(e) => setEpisodeFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>12px</span>
                <span>18px (Default)</span>
                <span>50px (Max)</span>
              </div>
            </div>

            {/* Color Customization Section */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  Custom Text & Badge Colors
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHeaderTextColor('');
                    setSubheaderTextColor('');
                    setAuthorTextColor('');
                    setAuthorBgColor('');
                    setEpisodeTextColor('');
                    setEpisodeBgColor('');
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
                >
                  Reset Colors
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                {/* Title Color */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Title Color:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={headerTextColor || '#ffffff'}
                      onChange={(e) => setHeaderTextColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setHeaderTextColor('')}
                      className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
                    >
                      Theme Gradient
                    </button>
                  </div>
                </div>

                {/* Subheader Color */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Subtitle Color:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={subheaderTextColor || '#f1f5f9'}
                      onChange={(e) => setSubheaderTextColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{subheaderTextColor || '#f1f5f9'}</span>
                  </div>
                </div>

                {/* Author Text & Box Color */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Author Text / Box Color:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={authorTextColor || '#ffffff'}
                      onChange={(e) => setAuthorTextColor(e.target.value)}
                      title="Text Color"
                      className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="color"
                      value={authorBgColor || '#1e293b'}
                      onChange={(e) => setAuthorBgColor(e.target.value)}
                      title="Box Background Color"
                      className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                {/* Episode Text & Box Color */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Episode Badge Text / Box:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={episodeTextColor || '#ffffff'}
                      onChange={(e) => setEpisodeTextColor(e.target.value)}
                      title="Text Color"
                      className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="color"
                      value={episodeBgColor || '#0f172a'}
                      onChange={(e) => setEpisodeBgColor(e.target.value)}
                      title="Badge Background Color"
                      className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo input (optional) */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Channel Logo / Watermark (Optional)</span>
              </label>
              <input
                type="file"
                ref={logoFileInputRef}
                onChange={handleLogoFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Browse Logo...
                </button>
                <input
                  type="text"
                  value={logoPathInput}
                  onChange={(e) => {
                    setLogoPathInput(e.target.value);
                    setLogoUrl(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyLogoPath()}
                  placeholder="/path/to/logo.png"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyLogoPath}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Apply
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => { setLogoUrl(''); setLogoPathInput(''); }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            </div>
            )}
          </div>

          {/* 4. YouTube Thumbnail Studio Card (5 Compositions) */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <button
              type="button"
              onClick={() => toggleSection('thumbnail')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block truncate">
                    YouTube Thumbnail Studio
                  </span>
                  <span className="text-[10px] text-slate-400">
                    6 High-CTR (1920×1080) Full HD Layouts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-amber-300 hidden sm:inline">
                  {THUMBNAIL_LAYOUT_OPTIONS.find((l) => l.id === selectedThumbnailLayout)?.labelEn}
                </span>
                {expandedSections.thumbnail ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.thumbnail && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Automatically syncs current book cover, title, author, and color schemes with 6 high-converting YouTube layouts.
                </p>

                {/* 6 Layout Selector Cards */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Select Thumbnail Layout (6 Presets):
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {THUMBNAIL_LAYOUT_OPTIONS.map((layout) => {
                      const isSelected = selectedThumbnailLayout === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => {
                            setSelectedThumbnailLayout(layout.id);
                            setActivePreviewMode('thumbnail');
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-rose-950/70 via-amber-950/50 to-slate-900 border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 shadow-md'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {layout.badge}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                {layout.labelEn}
                              </span>
                              <span className="text-[10px] font-mono text-amber-300/80 ml-2 shrink-0">
                                Preset #{layout.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {layout.id === 'layout-1-split' && 'Left 3D hero book cover with luminous glowing typography on the right.'}
                              {layout.id === 'layout-2-center' && 'Centered large book cover framed by top cinematic header and bottom badges.'}
                              {layout.id === 'layout-3-editorial' && 'Full right-side magazine artwork cover with editorial typographic hierarchy.'}
                              {layout.id === 'layout-4-isometric' && 'Angled 3D book perspective with realistic reflections and golden badges.'}
                              {layout.id === 'layout-5-bold' && 'Bold, high-visibility headline banner optimized for mobile YouTube feeds.'}
                              {layout.id === 'layout-6-action' && 'High-contrast dynamic rays, punchy bold title, and intense book presentation.'}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 self-center" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dedicated Thumbnail Typography & Color Customization Controls */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCustomThumbStyles}
                        onChange={(e) => {
                          if (e.target.checked && !useCustomThumbStyles) {
                            handleSyncThumbStylesFromVideo();
                          } else {
                            setUseCustomThumbStyles(e.target.checked);
                          }
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500/30 w-4 h-4"
                      />
                      <ImageIcon className="w-3.5 h-3.5 text-rose-400 inline mr-1.5" /><span>Customize Thumbnail Font Sizes & Colors</span>
                    </label>

                    {useCustomThumbStyles && (
                      <button
                        type="button"
                        onClick={handleSyncThumbStylesFromVideo}
                        className="text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 transition-all font-semibold flex items-center gap-1"
                        title="Copy text sizes and colors from current video settings"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Sync from Video</span>
                      </button>
                    )}
                  </div>

                  {useCustomThumbStyles && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fade-in text-xs">
                      {/* Thumbnail Header Font Size */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Title Font Size:</span>
                          <span className="font-mono text-rose-400 font-bold">{thumbHeaderFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={40}
                          max={130}
                          step={2}
                          value={thumbHeaderFontSize}
                          onChange={(e) => setThumbHeaderFontSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                      </div>

                      {/* Thumbnail Subheader Font Size */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Subtitle Font Size:</span>
                          <span className="font-mono text-amber-400 font-bold">{thumbSubheaderFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={16}
                          max={60}
                          step={1}
                          value={thumbSubheaderFontSize}
                          onChange={(e) => setThumbSubheaderFontSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      {/* Thumbnail Author Font Size */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Author Font Size:</span>
                          <span className="font-mono text-sky-400 font-bold">{thumbAuthorFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={14}
                          max={50}
                          step={1}
                          value={thumbAuthorFontSize}
                          onChange={(e) => setThumbAuthorFontSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>

                      {/* Thumbnail Episode Font Size */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Episode Badge Font Size:</span>
                          <span className="font-mono text-emerald-400 font-bold">{thumbEpisodeFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={14}
                          max={50}
                          step={1}
                          value={thumbEpisodeFontSize}
                          onChange={(e) => setThumbEpisodeFontSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      {/* Quick Color Overrides for Thumbnail */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Title Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={thumbHeaderTextColor || '#ffffff'}
                              onChange={(e) => setThumbHeaderTextColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span className="font-mono text-[10px] text-slate-400 truncate">
                              {thumbHeaderTextColor || 'Default'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Author Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={thumbAuthorTextColor || '#fbbf24'}
                              onChange={(e) => setThumbAuthorTextColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span className="font-mono text-[10px] text-slate-400 truncate">
                              {thumbAuthorTextColor || 'Default'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Switcher & Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActivePreviewMode(activePreviewMode === 'thumbnail' ? 'video' : 'thumbnail')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      activePreviewMode === 'thumbnail'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{activePreviewMode === 'thumbnail' ? 'Switch to Video' : 'Preview 16:9'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateThumbnail}
                    disabled={isGeneratingThumbnail}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
                  >
                    {isGeneratingThumbnail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Save 1080p Full HD PNG</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Thumbnail Feedback Toast */}
                {thumbnailToast && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-fade-in ${
                      thumbnailToast.status === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : thumbnailToast.status === 'error'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                        : 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {thumbnailToast.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {thumbnailToast.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        {thumbnailToast.status === 'generating' && <Loader2 className="w-4 h-4 animate-spin text-amber-300 shrink-0" />}
                        <span className="font-semibold truncate">{thumbnailToast.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setThumbnailToast(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {thumbnailToast.status === 'success' && thumbnailToast.filePath && (
                      <div className="space-y-1.5 pt-1 border-t border-emerald-500/20">
                        <div className="text-[10px] font-mono text-emerald-300/80 truncate">
                          {thumbnailToast.filePath}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAudiobookFolder('thumbnails')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span>Reveal in Folder</span>
                          </button>
                          {thumbnailToast.downloadUrl && (
                            <a
                              href={thumbnailToast.downloadUrl}
                              download={thumbnailToast.fileName || 'thumbnail.png'}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-slate-700 transition-all"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download PNG</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Background Video Loops (Real 1080p Video Loops) - Collapsible Accordion Drawer */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('videoPresets')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block truncate">
                    Background Video Loops
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Seamless 20s Ambient Loops
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-300 hidden sm:inline truncate max-w-[130px]">
                  {bgVideoUrl ? 'Custom Video' : currentTheme.nameEn}
                </span>
                {expandedSections.videoPresets ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.videoPresets && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400">
                  Slowed motion combined with seamless forward + reverse ping-pong for an infinite, smooth ambient video loop.
                </p>

                {/* Custom Video & Stock Video Downloader Section */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <VideoIcon className="w-4 h-4 text-indigo-400" />
                      Custom Video Loop (Local MP4 or Pexels/Pixabay URL):
                    </span>
                    {bgVideoUrl && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        Custom Video Active
                      </span>
                    )}
                  </div>

                  {/* Local File Browse & Path Input */}
                  <input
                    type="file"
                    ref={bgVideoFileInputRef}
                    onChange={handleVideoFileChange}
                    accept="video/mp4,video/webm"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bgVideoFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Browse MP4...
                    </button>
                    <input
                      type="text"
                      value={bgVideoPathInput}
                      onChange={(e) => {
                        setBgVideoPathInput(e.target.value);
                        setBgVideoUrl(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyVideoPath()}
                      placeholder="/path/to/loop_video.mp4"
                      className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVideoPath}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 border border-slate-700"
                    >
                      Apply Path
                    </button>
                  </div>

                  {/* Stock Video Downloader (Pexels / Pixabay / Direct Link) */}
                  <div className="pt-2 border-t border-indigo-500/20 space-y-1.5">
                    <span className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      Stock / Web Video URL (Pexels / Pixabay / Direct MP4):
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={stockVideoUrlInput}
                        onChange={(e) => setStockVideoUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDownloadStockVideo()}
                        placeholder="https://www.pexels.com/video/... or direct MP4 URL"
                        className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-indigo-500/30 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleDownloadStockVideo}
                        disabled={isDownloadingStockVideo || !stockVideoUrlInput.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-purple-900/30"
                      >
                        {isDownloadingStockVideo ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Downloading audio...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download & Apply Loop</span>
                          </>
                        )}
                      </button>
                    </div>

                    {stockVideoError && (
                      <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                        <span>{stockVideoError}</span>
                      </div>
                    )}

                    {stockVideoSuccess && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                        <span>{stockVideoSuccess}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Downloaded Background Presets Library */}
                {customBgPresets.length > 0 && (
                  <div className="space-y-2 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Saved Custom Background Presets ({customBgPresets.length})</span>
                      </span>
                      <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/20 px-2 py-0.5 rounded-md">
                        Saved in Project
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {customBgPresets.map((preset) => {
                        const isSelected = selectedThemeId === 'custom-video' && bgVideoUrl === preset.videoUrl;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setSelectedThemeId('custom-video');
                              setBgVideoUrl(preset.videoUrl);
                              setBgVideoPathInput(preset.videoUrl);
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative flex items-center justify-between group ${
                              isSelected
                                ? 'bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-slate-900 border-indigo-400 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 flex-shrink-0">
                                <Film className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold truncate text-slate-100">
                                  {preset.nameEn || preset.nameMm}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate">
                                  20s Seamless Loop • {preset.nameEn}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 ml-2">
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustomBgPreset(preset.id, e)}
                                title="Delete Preset"
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {AUDIOBOOK_THEMES.map((theme, idx) => {
                    const isSelected = selectedThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-br from-purple-900/60 to-slate-900 border-purple-400 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-800 text-slate-300">
                              {idx + 1}
                            </span>
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/30"
                              style={{ background: theme.accentColor, boxShadow: `0 0 8px ${theme.accentColor}` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">
                            {theme.nameEn}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-100 truncate">
                          {theme.nameEn}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {theme.nameEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 6. Background Gradient Color Presets - Collapsible Accordion Drawer */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('gradients')}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block truncate">
                    Background Gradients & Ambient
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {AUDIOBOOK_GRADIENT_PRESETS.length} Studio Gradients
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-4 h-4 rounded-md border border-white/30 shadow-sm shrink-0"
                  style={{
                    background: AUDIOBOOK_GRADIENT_PRESETS.find((g) => g.id === selectedGradientId)?.gradient || '#1e293b',
                  }}
                />
                <span className="text-[11px] font-bold text-slate-300 hidden sm:inline truncate max-w-[130px]">
                  {AUDIOBOOK_GRADIENT_PRESETS.find((g) => g.id === selectedGradientId)?.nameEn || AUDIOBOOK_GRADIENT_PRESETS.find((g) => g.id === selectedGradientId)?.nameMm}
                </span>
                {expandedSections.gradients ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.gradients && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                {/* Category Filter Tabs (Light vs Dark) */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setGradientCategory('all')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all ${
                      gradientCategory === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({AUDIOBOOK_GRADIENT_PRESETS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradientCategory('light')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      gradientCategory === 'light'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-amber-300/80 hover:text-amber-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradientCategory('dark')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      gradientCategory === 'dark'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-300/80 hover:text-purple-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Dark
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredGradients.map((g) => {
                    const isSelected = selectedGradientId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGradientId(g.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-amber-400 bg-slate-800 shadow-md ring-1 ring-amber-400 text-white'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg shrink-0 border border-white/20 shadow-sm"
                          style={{ background: g.gradient }}
                        />
                        <div className="truncate text-xs font-semibold flex-1">
                          {g.nameEn || g.nameMm}
                        </div>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                          {g.category === 'light' ? 'Light' : 'Dark'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Remotion Interactive Studio Player Preview (col-span-7) - STICKY FIXED & STABLE */}
        <div className="lg:col-span-7 min-w-0 lg:sticky lg:top-4 space-y-4 self-start w-full">
          
          {/* Main Interactive Player Card (Video Loop vs YouTube Thumbnail Switcher) */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-3">
            
            {/* Live Preview Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800/90 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActivePreviewMode('video')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePreviewMode === 'video'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Video Loop ({resolution === '2k' ? '2K' : '1080p'})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewMode('thumbnail')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePreviewMode === 'thumbnail'
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>YouTube Thumbnail (16:9)</span>
                </button>
              </div>

              {activePreviewMode === 'thumbnail' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {THUMBNAIL_LAYOUT_OPTIONS.find((l) => l.id === selectedThumbnailLayout)?.labelEn}
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateThumbnail}
                    disabled={isGeneratingThumbnail}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-all disabled:opacity-50"
                  >
                    {isGeneratingThumbnail ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Save PNG</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-bold">
                    {resolution === '2k' ? '2560 × 1440 (2K)' : '1920 × 1080 (FHD)'} @ 30 FPS
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                    Theme: {currentTheme.nameEn}
                  </span>
                </div>
              )}
            </div>

            {/* Remotion Player Container - Supports Full-Duration Audio Stream + 20s Background Loop OR 16:9 Thumbnail */}
            {activePreviewMode === 'video' ? (
              (() => {
                const memoizedInputProps = {
                  headerTitle,
                  subheader,
                  authorName,
                  episodeText,
                  headerFontSize,
                  subheaderFontSize,
                  authorFontSize,
                  episodeFontSize,
                  artworkUrl,
                  artworkShape,
                  artworkWidth,
                  logoUrl,
                  audioUrl,
                  bgVideoUrl,
                  themeId: selectedThemeId,
                  gradientId: selectedGradientId,
                  loopDurationFrames: 600,
                  headerTextColor,
                  subheaderTextColor,
                  authorTextColor,
                  authorBgColor,
                  episodeTextColor,
                  episodeBgColor,
                };

                return (
                  <div
                    className="w-full bg-black rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <Player
                      key={`audiobook-player-${audioDurationSec > 0 ? audioDurationSec : 'default'}`}
                      component={AudiobookComposition as any}
                      inputProps={memoizedInputProps}
                      durationInFrames={Math.max(600, audioDurationSec > 0 ? Math.round(audioDurationSec * 30) : 600)}
                      fps={30}
                      compositionWidth={resolution === '2k' ? 2560 : 1920}
                      compositionHeight={resolution === '2k' ? 1440 : 1080}
                      style={{ width: '100%', height: '100%' }}
                      controls
                      autoPlay={false}
                      loop={false}
                    />
                  </div>
                );
              })()
            ) : (
              <div
                className="w-full bg-black rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center relative group"
                style={{ aspectRatio: '16/9' }}
              >
                <Player
                  key={`audiobook-thumbnail-${selectedThumbnailLayout}-${artworkUrl || 'no-art'}-${headerTitle}`}
                  component={AudiobookThumbnailComposition as any}
                  inputProps={{
                    headerTitle,
                    subheader,
                    authorName,
                    episodeText,
                    headerFontSize: useCustomThumbStyles ? thumbHeaderFontSize : headerFontSize,
                    subheaderFontSize: useCustomThumbStyles ? thumbSubheaderFontSize : subheaderFontSize,
                    authorFontSize: useCustomThumbStyles ? thumbAuthorFontSize : authorFontSize,
                    episodeFontSize: useCustomThumbStyles ? thumbEpisodeFontSize : episodeFontSize,
                    artworkUrl,
                    artworkShape,
                    themeId: selectedThemeId,
                    gradientId: selectedGradientId,
                    bgVideoUrl,
                    headerTextColor: (useCustomThumbStyles && thumbHeaderTextColor) ? thumbHeaderTextColor : headerTextColor,
                    subheaderTextColor: (useCustomThumbStyles && thumbSubheaderTextColor) ? thumbSubheaderTextColor : subheaderTextColor,
                    authorTextColor: (useCustomThumbStyles && thumbAuthorTextColor) ? thumbAuthorTextColor : authorTextColor,
                    authorBgColor: (useCustomThumbStyles && thumbAuthorBgColor) ? thumbAuthorBgColor : authorBgColor,
                    episodeTextColor: (useCustomThumbStyles && thumbEpisodeTextColor) ? thumbEpisodeTextColor : episodeTextColor,
                    episodeBgColor: (useCustomThumbStyles && thumbEpisodeBgColor) ? thumbEpisodeBgColor : episodeBgColor,
                    layoutId: selectedThumbnailLayout,
                  }}
                  durationInFrames={1}
                  fps={30}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{ width: '100%', height: '100%' }}
                  controls={false}
                  autoPlay={false}
                  loop={false}
                />
              </div>
            )}

            {/* Player Guide Tips */}
            {activePreviewMode === 'video' ? (
              <div className="space-y-3 px-2 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
                  <span>Full-screen interactive playback with accurate timeline and audio sync.</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-amber-300">Loop: 20s Ping-Pong</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Total Audio: {formatDuration(audioDurationSec || 20)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQueueOrStartRender}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {activeJob ? (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Queue ({queueJobs.length + 1})</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Start Fast Export ({resolution.toUpperCase()} MP4)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 px-2 pt-1">
                <span>High-CTR 1080p Full HD thumbnail rendered with professional layout & typography.</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAudiobookFolder('thumbnails')}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>Open Thumbnails Folder</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Render Alert & Progress */}
          {renderError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2.5 animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{renderError}</span>
              </div>
              <button
                type="button"
                onClick={() => setRenderError(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TABBED BATCH QUEUE & RENDER HISTORY DASHBOARD */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header Tabs Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQueueTab('queue')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    queueTab === 'queue'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Render Queue</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    (activeJob || queueJobs.length > 0)
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {queueJobs.length + (activeJob ? 1 : 0)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setQueueTab('history')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    queueTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Render History</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">
                    {historyJobs.length}
                  </span>
                </button>
              </div>

              {queueTab === 'history' && historyJobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearHistory()}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: QUEUE */}
            {queueTab === 'queue' && (
              <div className="p-5 space-y-4">
                {/* 1. Active Running Job */}
                {activeJob ? (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 truncate">
                          <span className="shrink-0 text-amber-300">Rendering Now:</span>
                          <span className="text-indigo-200 normal-case truncate">{activeJob.headerTitle}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                          {activeJob.resolution.toUpperCase()}
                        </span>
                        <span className="font-mono text-sm font-bold text-white">{activeJob.progress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 transition-all duration-300 rounded-full"
                        style={{ width: `${activeJob.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="truncate pr-2">{activeJob.statusMessage}</span>
                      {activeJob.audioDurationSec && (
                        <span className="shrink-0 text-slate-400 font-mono">
                          Duration: {formatDuration(activeJob.audioDurationSec)}
                        </span>
                      )}
                    </div>

                    {/* Expandable Real-Time Console Logs */}
                    {activeJob.logs && activeJob.logs.length > 0 && (
                      <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 p-2.5 max-h-36 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar text-slate-400">
                        {activeJob.logs.map((log: string, idx: number) => (
                          <div key={idx} className="truncate">
                            <span className="text-emerald-400 select-none mr-1.5">›</span>
                            <span className={(log.toLowerCase().includes('error') || log.toLowerCase().includes('failed')) ? 'text-rose-400' : (log.includes('Finished') || log.includes('saved') || log.includes('complete')) ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                              {log}
                            </span>
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* 2. Pending Queued Jobs */}
                {queueJobs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Queued Jobs in Pipeline ({queueJobs.length})
                    </div>
                    {queueJobs.map((qJob, idx) => (
                      <div
                        key={qJob.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                            #{idx + 1}
                          </span>
                          {qJob.artworkUrl ? (
                            <img
                              src={qJob.artworkUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{qJob.headerTitle}</h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {qJob.authorName ? `Author: ${qJob.authorName}` : ''}
                              {qJob.audioDurationSec ? ` • ${formatDuration(qJob.audioDurationSec)}` : ''}
                              {` • ${qJob.resolution.toUpperCase()}`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelQueueItem(qJob.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors shrink-0"
                          title="Remove from Queue"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State or Last Job Summary */}
                {!activeJob && queueJobs.length === 0 && historyJobs.length > 0 && (
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    historyJobs[0].status === 'failed'
                      ? 'bg-rose-950/40 border-rose-500/40'
                      : 'bg-emerald-950/30 border-emerald-500/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${historyJobs[0].status === 'failed' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>{historyJobs[0].status === 'failed' ? 'Export Failed:' : 'Completed Video:'}</span>
                          <span className="text-slate-200 normal-case">{historyJobs[0].headerTitle}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {historyJobs[0].resolution.toUpperCase()}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${
                      historyJobs[0].status === 'failed' ? 'text-rose-300 font-medium' : 'text-slate-300'
                    }`}>
                      {historyJobs[0].statusMessage}
                    </p>

                    {/* Show logs of the last job */}
                    {historyJobs[0].logs && historyJobs[0].logs.length > 0 && (
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 max-h-36 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar text-slate-400">
                        {historyJobs[0].logs.map((log: string, idx: number) => (
                          <div key={idx} className="truncate">
                            <span className="text-emerald-400 select-none mr-1.5">›</span>
                            <span className={(log.toLowerCase().includes('error') || log.toLowerCase().includes('failed')) ? 'text-rose-400' : (log.includes('Finished') || log.includes('saved') || log.includes('complete')) ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                              {log}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State when no jobs at all */}
                {!activeJob && queueJobs.length === 0 && historyJobs.length === 0 && (
                  <div className="p-8 text-center space-y-2">
                    <ListOrdered className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">No Pending Jobs in Queue</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Batch render audiobooks seamlessly. Click "Start Fast Export" or "Add to Queue" above to queue multiple production jobs.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: HISTORY */}
            {queueTab === 'history' && (
              <div className="p-5 space-y-3">
                {historyJobs.length > 0 ? (
                  historyJobs.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.artworkUrl ? (
                            <img
                              src={item.artworkUrl}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              <Film className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{item.headerTitle}</h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {item.subheader || ''} {item.authorName ? `• Author: ${item.authorName}` : ''}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              {item.status === 'failed' ? (
                                <span className="font-mono text-rose-300 font-bold bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                                  FAILED
                                </span>
                              ) : (
                                <span className="font-mono text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                  COMPLETED
                                </span>
                              )}
                              <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                                {item.resolution?.toUpperCase() || '1080P'}
                              </span>
                              {item.audioDurationSec && (
                                <span className="font-mono text-emerald-400">
                                  {formatDuration(item.audioDurationSec)}
                                </span>
                              )}
                              {item.fileSizeBytes && (
                                <span className="text-slate-400">
                                  {(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                                </span>
                              )}
                              {item.completedAt && (
                                <span className="text-slate-400">
                                  {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleClearHistory(item.id)}
                          className="p-1 rounded-lg text-slate-600 hover:text-rose-400 transition-colors shrink-0"
                          title="Delete from History"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Error details if failed */}
                      {item.status === 'failed' && (
                        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] leading-relaxed">
                          {item.statusMessage}
                        </div>
                      )}

                      {/* Action Buttons for this History Item */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                        {item.localFilePath && (
                          <button
                            type="button"
                            onClick={() => handleOpenJobInFinder(item.localFilePath)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            <Folder className="w-3.5 h-3.5" />
                            Reveal in Finder
                          </button>
                        )}
                        {item.localFilePath && (
                          <button
                            type="button"
                            onClick={() => handlePlayJobVideo(item.localFilePath)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Play Video
                          </button>
                        )}
                        {item.downloadUrl && (
                          <a
                            href={item.downloadUrl}
                            download={item.downloadUrl.split('/').pop() || 'audiobook.mp4'}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                          >
                            <Download className="w-3 h-3" />
                            Web Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <History className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">No History Yet</p>
                    <p className="text-[11px] text-slate-500">
                      Completed videos will appear here for instant preview and download.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
