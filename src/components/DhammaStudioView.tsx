import React from 'react';
import {
  Flower2,
  Headphones,
  BookOpen,
  Volume2,
  Film,
  Type,
  Download,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface DhammaStudioViewProps {
  onSwitchToAudiobook?: () => void;
}

export const DhammaStudioView: React.FC<DhammaStudioViewProps> = ({ onSwitchToAudiobook }) => {
  return (
    <div
      className="max-w-[1720px] mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in font-pann-yeat"
      style={{ fontFamily: "'PannYeat', 'Padauk', sans-serif" }}
    >
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-amber-950/60 via-slate-900/90 to-slate-950 border border-amber-500/30 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
            <Flower2 className="w-4 h-4 text-amber-400" />
            <span>Dhamma Studio Suite • Preview</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Dhamma Studio Pro
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Specialized video production suite for Theravada Buddhist Sutta, Paritta Chanting, and Dhamma Sermon visualizers with synchronized Pali verses and sacred motion ambiance.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onSwitchToAudiobook}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Launch Audiobook Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <span className="text-xs text-amber-200/80 bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Core pipeline configured & ready for module expansion</span>
            </span>
          </div>
        </div>
      </div>

      {/* Feature Architecture Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Planned Production Modules</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Architecture Preview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Sutta & Paritta */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sutta & Paritta Chanting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated video synchronization for the Great Parittas (Mangala Sutta, Ratana Sutta, Metta Sutta, Mora Sutta, Bojjhanga Sutta) with sacred temple chimes and verse pacing.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Pali Canon Preset Library</span>
            </div>
          </div>

          {/* Card 2: Dhamma Sermon Visualizer */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dhamma Sermon (တရားတော်) Visualizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Long-form audio waveform visualizer designed for Sayadaw discourses (1 to 4 hours) with customizable monk portrait frames, monastery emblems, and discourse titles.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Ultra-Long Audio Optimization</span>
            </div>
          </div>

          {/* Card 3: Sacred Motion Ambience */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sacred Motion Ambience</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamless 20s ambient loops including Shwedagon Pagoda twilight, Bagan sunrise mist, blooming sacred lotuses, Bodhi tree leaves, and incense meditation smoke.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Cinematic 1080p & 2K Presets</span>
            </div>
          </div>

          {/* Card 4: Bilingual Subtitles */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Type className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Bilingual Verse Synchronization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Word-by-word Pali chanting highlighting accompanied by Burmese meaning subtitles, with customizable golden calligraphy and luminous glow typography.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>PannYeat Sacred Typography</span>
            </div>
          </div>

          {/* Card 5: High-CTR Buddhist Thumbnails */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dhamma YouTube Thumbnails</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-CTR 1080p Full HD thumbnail generator tailored for Buddhist channels, featuring sacred golden badges, sermon topic banners, and monastery credits.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>1080p Instant PNG Export</span>
            </div>
          </div>

          {/* Card 6: Pure CPU & Batch Render */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">High-Speed CPU Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Remotion with pure CPU software rendering, concurrency throttling, and memory stability for error-free long-duration exports.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Universal macOS & Windows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Switcher Footer Box */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Dhamma Studio modules are currently in design. You can switch to Audiobook Studio at any time to generate full audiobooks and videos.
        </p>
        <button
          type="button"
          onClick={onSwitchToAudiobook}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs border border-slate-700 hover:border-indigo-500 transition-all"
        >
          <Headphones className="w-4 h-4 text-indigo-400" />
          <span>Switch to Audiobook Studio</span>
        </button>
      </div>
    </div>
  );
};
