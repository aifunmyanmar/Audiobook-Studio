import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import { exec, execSync, spawn } from 'node:child_process';
import type { Plugin } from 'vite';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

export function cleanPlatformPath(raw: string): string {
  let p = (raw || '').trim();
  while (true) {
    const before = p;
    p = p.replace(/^["'`\s:;,]+|["'`\s:;,]+$/g, '').trim();
    p = p.replace(/^file:\/\//i, '').trim();
    if (p === before) break;
  }
  if (p.startsWith('~/') || p.startsWith('~\\')) {
    p = path.join(os.homedir(), p.slice(2));
  }
  if (!fs.existsSync(p) && p.includes('\\ ')) {
    const unescaped = p.replace(/\\ /g, ' ');
    if (fs.existsSync(unescaped)) {
      p = unescaped;
    }
  }
  return p;
}

export function getFfprobePath(): string {
  const candidates = isWindows
    ? [
        'ffprobe.exe',
        'ffprobe',
        'C:\\ffmpeg\\bin\\ffprobe.exe',
        path.join(process.cwd(), 'bin', 'ffprobe.exe'),
      ]
    : [
        'ffprobe',
        '/opt/homebrew/bin/ffprobe',
        '/usr/local/bin/ffprobe',
        '/usr/bin/ffprobe',
      ];

  for (const c of candidates) {
    try {
      execSync(`"${c}" -version`, { stdio: 'ignore' });
      return c;
    } catch {}
  }
  return 'ffprobe';
}

export function getFfmpegPath(): string {
  const candidates = isWindows
    ? [
        'ffmpeg.exe',
        'ffmpeg',
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        path.join(process.cwd(), 'bin', 'ffmpeg.exe'),
      ]
    : [
        'ffmpeg',
        '/opt/homebrew/bin/ffmpeg',
        '/usr/local/bin/ffmpeg',
        '/usr/bin/ffmpeg',
      ];

  for (const c of candidates) {
    try {
      execSync(`"${c}" -version`, { stdio: 'ignore' });
      return c;
    } catch {}
  }
  return 'ffmpeg';
}

export function getYtDlpPath(): string {
  const candidates = isWindows
    ? [
        'yt-dlp.exe',
        'yt-dlp',
        path.join(process.cwd(), 'bin', 'yt-dlp.exe'),
      ]
    : [
        'yt-dlp',
        '/opt/homebrew/bin/yt-dlp',
        '/usr/local/bin/yt-dlp',
        path.join(os.homedir(), 'Library/Python/3.9/bin/yt-dlp'),
      ];

  for (const c of candidates) {
    try {
      execSync(`"${c}" --version`, { stdio: 'ignore' });
      return c;
    } catch {}
  }
  return 'yt-dlp';
}

function getSystemChromeExecutable(): string | undefined {
  if (isWindows) {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  } else if (isMac) {
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined;
}

function openFolderInOS(folderPath: string) {
  if (isWindows) {
    exec(`explorer "${folderPath.replace(/\//g, '\\')}"`);
  } else if (isMac) {
    exec(`open "${folderPath}"`);
  } else {
    exec(`xdg-open "${folderPath}"`);
  }
}

function revealFileInOS(filePath: string) {
  if (isWindows) {
    exec(`explorer /select,"${filePath.replace(/\//g, '\\')}"`);
  } else if (isMac) {
    exec(`open -R "${filePath}"`);
  } else {
    exec(`xdg-open "${path.dirname(filePath)}"`);
  }
}

function playVideoInOS(filePath: string) {
  if (isWindows) {
    exec(`start "" "${filePath.replace(/\//g, '\\')}"`);
  } else if (isMac) {
    exec(`open "${filePath}"`);
  } else {
    exec(`xdg-open "${filePath}"`);
  }
}

export function audiobookServerPlugin(): Plugin {
  return {
    name: 'audiobook-studio-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // --- AUDIOBOOK QUEUE & HISTORY PERSISTENCE ARCHITECTURE ---
        interface AudiobookJobItem {
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

        const AUDIOBOOK_QUEUE_FILE = path.resolve(process.cwd(), 'data', 'audiobook_temp', 'render_queue.json');
        const AUDIOBOOK_HISTORY_FILE = path.resolve(process.cwd(), 'data', 'audiobook_temp', 'render_history.json');

        const USER_AUDIOBOOK_DIR = path.join(os.homedir(), 'Downloads', 'Audiobook');
        const USER_VIDEOS_DIR = path.join(USER_AUDIOBOOK_DIR, 'Audiobook');
        const USER_THUMBNAILS_DIR = path.join(USER_AUDIOBOOK_DIR, 'Thumbnails');
        const USER_YT_DOWNLOADS_DIR = path.join(USER_AUDIOBOOK_DIR, 'YouTube Downloads');
        const USER_AI_GEN_DIR = path.join(USER_AUDIOBOOK_DIR, 'AI Generations');
        const USER_BG_VIDEOS_DIR = path.join(USER_AUDIOBOOK_DIR, 'BG Videos');

        function ensureAudiobookDirs() {
          const dirs = [
            USER_AUDIOBOOK_DIR,
            USER_VIDEOS_DIR,
            USER_THUMBNAILS_DIR,
            USER_YT_DOWNLOADS_DIR,
            USER_AI_GEN_DIR,
            USER_BG_VIDEOS_DIR,
            path.resolve(process.cwd(), 'public', 'downloads'),
            path.resolve(process.cwd(), 'public', 'backgrounds'),
            path.resolve(process.cwd(), 'data', 'audiobook_temp'),
          ];
          for (const d of dirs) {
            try {
              if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
            } catch {}
          }
        }
        ensureAudiobookDirs();

        function run48HourCleanup(isManual = false) {
          try {
            ensureAudiobookDirs();
            const now = Date.now();
            const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

            let deletedCount = 0;
            let freedBytes = 0;

            const cleanDirectory = (dirPath: string, isRecursive = false) => {
              if (!fs.existsSync(dirPath)) return;
              const entries = fs.readdirSync(dirPath, { withFileTypes: true });
              for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                  if (isRecursive) cleanDirectory(fullPath, isRecursive);
                  continue;
                }
                if (entry.name.startsWith('.') || entry.name.endsWith('.json')) continue;

                try {
                  const stat = fs.statSync(fullPath);
                  const ageMs = now - stat.mtimeMs;
                  if (ageMs > MAX_AGE_MS) {
                    freedBytes += stat.size;
                    fs.unlinkSync(fullPath);
                    deletedCount++;
                    console.log(`[Audiobook Auto-Cleanup] 🗑️ Deleted (>48h): ${entry.name}`);
                  }
                } catch {}
              }
            };

            // 1. Dedicated Audiobook Videos folder (>48h)
            cleanDirectory(USER_VIDEOS_DIR, false);
            cleanDirectory(USER_AUDIOBOOK_DIR, false);
            cleanDirectory(USER_THUMBNAILS_DIR, false);
            cleanDirectory(USER_YT_DOWNLOADS_DIR, false);
            cleanDirectory(USER_AI_GEN_DIR, false);

            const pubDownloads = path.resolve(process.cwd(), 'public', 'downloads');
            cleanDirectory(pubDownloads, false);

            const tempAudiobook = path.resolve(process.cwd(), 'data', 'audiobook_temp');
            cleanDirectory(tempAudiobook, false);

            if (deletedCount > 0) {
              const freedMb = (freedBytes / (1024 * 1024)).toFixed(1);
              console.log(`[Audiobook Auto-Cleanup] ✅ Cleaned ${deletedCount} files older than 48 hours (${freedMb} MB freed).`);
            } else if (isManual) {
              console.log('[Audiobook Auto-Cleanup] ✅ All result files are within the 48-hour window.');
            }
          } catch (err) {
            console.warn('[Audiobook Auto-Cleanup Error]', err);
          }
        }

        // Run cleanup once on server startup silently, and strictly schedule every 1 hour (60 minutes)
        if (!(globalThis as any).__audiobookCleanupInitialized) {
          (globalThis as any).__audiobookCleanupInitialized = true;
          try { run48HourCleanup(false); } catch {}
        }
        if ((globalThis as any).__audiobookCleanupInterval) {
          clearInterval((globalThis as any).__audiobookCleanupInterval);
        }
        (globalThis as any).__audiobookCleanupInterval = setInterval(() => {
          try { run48HourCleanup(false); } catch {}
        }, 60 * 60 * 1000);

        function getAudiobookQueue(): AudiobookJobItem[] {
          try {
            if (fs.existsSync(AUDIOBOOK_QUEUE_FILE)) {
              return JSON.parse(fs.readFileSync(AUDIOBOOK_QUEUE_FILE, 'utf-8'));
            }
          } catch {}
          return [];
        }

        function saveAudiobookQueue(q: AudiobookJobItem[]) {
          try {
            const dir = path.dirname(AUDIOBOOK_QUEUE_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(AUDIOBOOK_QUEUE_FILE, JSON.stringify(q, null, 2), 'utf-8');
          } catch (e) {
            console.warn('[Queue Save Error]', e);
          }
        }

        function getAudiobookHistory(): AudiobookJobItem[] {
          try {
            if (fs.existsSync(AUDIOBOOK_HISTORY_FILE)) {
              return JSON.parse(fs.readFileSync(AUDIOBOOK_HISTORY_FILE, 'utf-8'));
            }
          } catch {}
          return [];
        }

        function saveAudiobookHistory(h: AudiobookJobItem[]) {
          try {
            const dir = path.dirname(AUDIOBOOK_HISTORY_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(AUDIOBOOK_HISTORY_FILE, JSON.stringify(h, null, 2), 'utf-8');
          } catch (e) {
            console.warn('[History Save Error]', e);
          }
        }

        if (typeof (globalThis as any).__isAudiobookQueueProcessing === 'undefined') {
          (globalThis as any).__isAudiobookQueueProcessing = false;
        }

        const activeAudiobookJobs: Map<string, AudiobookJobItem> =
          (global as any).__audiobookJobs || ((global as any).__audiobookJobs = new Map());

        // In-memory live active job pointer for real-time log & progress streaming to UI
        let currentRenderingJob: AudiobookJobItem | null = (globalThis as any).__currentAudiobookJob || null;

        const renderCacheDir = path.resolve(process.cwd(), 'data', 'render_cache');
        if (!fs.existsSync(renderCacheDir)) fs.mkdirSync(renderCacheDir, { recursive: true });

        function cacheBase64ToDisk(base64Data: string, prefix = 'asset'): string {
          if (!base64Data || !base64Data.startsWith('data:')) return base64Data;
          const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
          if (!match) return base64Data;
          const mime = match[1];
          const b64 = match[2];
          const ext = mime.includes('png') ? '.png' : (mime.includes('wav') ? '.wav' : (mime.includes('mp3') ? '.mp3' : '.jpg'));
          const hash = crypto.createHash('md5').update(b64.slice(0, 1000)).digest('hex');
          const filename = `${prefix}_${hash}${ext}`;
          const filePath = path.join(renderCacheDir, filename);
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
          }
          return `http://localhost:1104/api/render-cache?file=${filename}`;
        }

        let cachedBundleLocation: string | null = null;

        function syncPublicDirToBundle(bundleLoc: string) {
          try {
            const srcPublic = path.resolve(process.cwd(), 'public');
            const dstPublic = path.join(bundleLoc, 'public');
            if (fs.existsSync(srcPublic) && fs.existsSync(dstPublic)) {
              fs.cpSync(srcPublic, dstPublic, {
                recursive: true,
                force: false,
                filter: (src) => {
                  const norm = src.replace(/\\/g, '/');
                  if (norm.includes('/downloads') || norm.endsWith('.mp4') || norm.endsWith('.zip')) {
                    return false;
                  }
                  return true;
                },
              });
            }
          } catch (err) {
            console.warn('[Sync Public to Bundle Warn]', err);
          }
        }

        async function getOrCreateBundle(forceFresh = false) {
          if (!forceFresh && cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
            syncPublicDirToBundle(cachedBundleLocation);
            return cachedBundleLocation;
          }
          const { bundle } = await import('@remotion/bundler');
          const entryPoint = path.resolve(process.cwd(), 'src/remotion/index.ts');
          const publicDir = path.resolve(process.cwd(), 'public');

          console.log('[Remotion Bundler] 📦 Compiling webpack bundle with publicDir:', publicDir);
          cachedBundleLocation = await bundle({
            entryPoint,
            publicDir,
            ignoreFile: (file) => {
              const norm = file.replace(/\\/g, '/');
              return norm.includes('/downloads') || norm.endsWith('.mp4') || norm.endsWith('.zip');
            },
            onProgress: (p) => {
              if (Math.round(p * 100) % 25 === 0) {
                console.log(`[Remotion Bundler] Packaging assets: ${Math.round(p * 100)}%`);
              }
            }
          });
          syncPublicDirToBundle(cachedBundleLocation);
          return cachedBundleLocation;
        }

        async function renderSingleAudiobookJob(job: AudiobookJobItem) {
          const is2K = job.resolution === '2k' || job.resolution === '1440p';
          const targetWidth = is2K ? 2560 : 1920;
          const targetHeight = is2K ? 1440 : 1080;
          const resLabel = is2K ? '2K QHD (2560x1440)' : '1080p Full HD';

          const appendLog = (msg: string) => {
            const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
            const entry = `[${ts}] ${msg}`;
            if (!job.logs) job.logs = [];
            job.logs.push(entry);
            job.statusMessage = msg;
            currentRenderingJob = job;
            (globalThis as any).__currentAudiobookJob = job;
            console.log(`[Audiobook Queue] ${entry}`);
          };

          currentRenderingJob = job;
          (globalThis as any).__currentAudiobookJob = job;
          appendLog(`Render job started. Target: ${resLabel}. Title: "${job.headerTitle}"`);
          const { renderMedia, selectComposition } = await import('@remotion/renderer');
          const bundleLocation = await getOrCreateBundle();
          const chromeExecutable = getSystemChromeExecutable();

          const tempDir = path.resolve(process.cwd(), 'data', 'audiobook_temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

          const publicDownloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
          if (!fs.existsSync(publicDownloadsDir)) fs.mkdirSync(publicDownloadsDir, { recursive: true });

          // 1. Resolve Audio File Path
          appendLog('Verifying audio file track...');
          let audioFilePath = '';
          const audioInput = (job.audioFilePath || '').trim();

          if (audioInput.includes('/api/audiobook/audio-file')) {
            try {
              const urlObj = new URL(audioInput, 'http://localhost');
              const pathParam = urlObj.searchParams.get('path');
              if (pathParam) {
                const cleaned = cleanPlatformPath(pathParam);
                if (fs.existsSync(cleaned)) audioFilePath = cleaned;
              }
            } catch {}
          }

          if (!audioFilePath && (audioInput.startsWith('/downloads/') || audioInput.includes('/downloads/'))) {
            try {
              const urlObj = new URL(audioInput, 'http://localhost');
              const relPath = urlObj.pathname.replace(/^\//, '');
              const pubPath = path.resolve(process.cwd(), 'public', relPath);
              if (fs.existsSync(pubPath)) audioFilePath = pubPath;
            } catch {}
          }

          if (!audioFilePath) {
            if (audioInput.startsWith('data:audio') || audioInput.startsWith('data:application')) {
              const match = audioInput.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                const b64 = match[2];
                const ext = match[1].includes('wav') ? '.wav' : (match[1].includes('m4a') ? '.m4a' : '.mp3');
                audioFilePath = path.join(tempDir, `audio_${job.id}${ext}`);
                fs.writeFileSync(audioFilePath, Buffer.from(b64, 'base64'));
              }
            } else if (audioInput) {
              const cleaned = cleanPlatformPath(audioInput);
              if (fs.existsSync(cleaned)) {
                audioFilePath = cleaned;
              } else if (fs.existsSync(path.resolve(process.cwd(), cleaned))) {
                audioFilePath = path.resolve(process.cwd(), cleaned);
              } else {
                const ytPath = path.join(USER_YT_DOWNLOADS_DIR, path.basename(cleaned));
                if (fs.existsSync(ytPath)) {
                  audioFilePath = ytPath;
                }
              }
            }
          }

          if (!audioFilePath || !fs.existsSync(audioFilePath)) {
            const debugInfo = audioInput ? `Input was: "${audioInput}"` : 'No audio input provided';
            appendLog(`❌ Audio file not found. ${debugInfo}`);
            throw new Error(`Audio file not found (${debugInfo}). Please provide a valid audio file or file path.`);
          }

          appendLog(`Audio track verified: ${path.basename(audioFilePath)} (${(fs.statSync(audioFilePath).size / (1024 * 1024)).toFixed(1)} MB)`);

          let audioDurationSec = job.audioDurationSec || 0;
          if (!audioDurationSec) {
            try {
              const ffprobePath = getFfprobePath();
              const probeOutput = execSync(`"${ffprobePath}" -v error -show_entries format=duration -of json "${audioFilePath}"`, { encoding: 'utf-8' });
              const probeJson = JSON.parse(probeOutput);
              audioDurationSec = parseFloat(probeJson.format?.duration || '0');
            } catch {}
          }
          const durMins = Math.floor(audioDurationSec / 60);
          const durSecs = Math.round(audioDurationSec % 60);
          appendLog(`Audio track duration: ${durMins}:${durSecs.toString().padStart(2, '0')} (${Math.round(audioDurationSec)} seconds)`);

          // 2. Cache Artwork & Logo to disk
          appendLog('Caching visual elements (cover artwork, logo, background)...');
          const cachedArtworkUrl = job.artworkUrl ? cacheBase64ToDisk(job.artworkUrl, 'artwork') : '';
          const cachedLogoUrl = job.logoUrl ? cacheBase64ToDisk(job.logoUrl, 'logo') : '';

          job.progress = 15;
          appendLog(`Launching Headless Chrome & Remotion composition (${targetWidth}x${targetHeight})...`);

          // 3. Select Composition
          const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'AudiobookVideo',
            inputProps: {
              headerTitle: job.headerTitle,
              subheader: job.subheader,
              authorName: job.authorName,
              episodeText: job.episodeText,
              headerFontSize: Number(job.headerFontSize) || 72,
              subheaderFontSize: Number(job.subheaderFontSize) || 32,
              authorFontSize: Number(job.authorFontSize) || 24,
              episodeFontSize: Number(job.episodeFontSize) || 18,
              artworkUrl: cachedArtworkUrl,
              artworkShape: (job.artworkShape as any) || 'book-cover',
              artworkWidth: Number(job.artworkWidth) || 420,
              logoUrl: cachedLogoUrl,
              bgVideoUrl: job.bgVideoUrl,
              themeId: (job.themeId as any) || 'horror-halloween',
              gradientId: job.gradientId,
              customGradient: job.customGradient,
              loopDurationFrames: 600,
              resolution: job.resolution || '1080p',
              headerTextColor: job.headerTextColor,
              subheaderTextColor: job.subheaderTextColor,
              authorTextColor: job.authorTextColor,
              authorBgColor: job.authorBgColor,
              episodeTextColor: job.episodeTextColor,
              episodeBgColor: job.episodeBgColor,
            },
          });

          composition.width = targetWidth;
          composition.height = targetHeight;
          composition.durationInFrames = 600; // 20-second visual loop

          const tempLoopPath = path.join(tempDir, `loop_${job.id}.mp4`);
          appendLog(`Encoding 600 frames (20-second ping-pong seamless loop) with lossless PNG frames...`);

          // 4. Render Remotion 20s Loop with LOSSLESS PNG frames
          let lastLoggedMilestone = 0;
          await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            imageFormat: 'png',
            concurrency: is2K ? 4 : 6,
            timeoutInMilliseconds: 150000,
            chromiumOptions: {
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--autoplay-policy=no-user-gesture-required',
                '--allow-file-access-from-files',
                '--disable-web-security',
              ],
            },
            acknowledgeRemotionLicense: true,
            crf: 14,
            pixelFormat: 'yuv420p',
            outputLocation: tempLoopPath,
            onProgress: ({ encodedFrames }) => {
              const remotionProgress = Math.round((encodedFrames / 600) * 50);
              job.progress = 15 + remotionProgress;
              job.statusMessage = `Encoding visual loop: ${encodedFrames}/600 frames (${Math.round((encodedFrames / 600) * 100)}%)...`;
              currentRenderingJob = job;
              (globalThis as any).__currentAudiobookJob = job;
              const milestone = Math.floor(encodedFrames / 60) * 10;
              if (milestone > lastLoggedMilestone && milestone <= 100) {
                lastLoggedMilestone = milestone;
                appendLog(`Remotion visual loop encoding: ${encodedFrames}/600 frames (${milestone}% complete)`);
              }
            },
            inputProps: {
              headerTitle: job.headerTitle,
              subheader: job.subheader,
              authorName: job.authorName,
              episodeText: job.episodeText,
              headerFontSize: Number(job.headerFontSize) || 72,
              subheaderFontSize: Number(job.subheaderFontSize) || 32,
              authorFontSize: Number(job.authorFontSize) || 24,
              episodeFontSize: Number(job.episodeFontSize) || 18,
              artworkUrl: cachedArtworkUrl,
              artworkShape: (job.artworkShape as any) || 'book-cover',
              artworkWidth: Number(job.artworkWidth) || 420,
              logoUrl: cachedLogoUrl,
              bgVideoUrl: job.bgVideoUrl,
              themeId: (job.themeId as any) || 'horror-halloween',
              gradientId: job.gradientId,
              customGradient: job.customGradient,
              loopDurationFrames: 600,
              resolution: job.resolution || '1080p',
              headerTextColor: job.headerTextColor,
              subheaderTextColor: job.subheaderTextColor,
              authorTextColor: job.authorTextColor,
              authorBgColor: job.authorBgColor,
              episodeTextColor: job.episodeTextColor,
              episodeBgColor: job.episodeBgColor,
            },
          });

          if (!fs.existsSync(tempLoopPath) || fs.statSync(tempLoopPath).size < 10000) {
            throw new Error('Failed to render Remotion visual loop');
          }

          appendLog(`Remotion visual loop completed (${(fs.statSync(tempLoopPath).size / (1024 * 1024)).toFixed(1)} MB)`);

          job.progress = 65;
          const durFmt = audioDurationSec > 0
            ? `${Math.floor(audioDurationSec / 60)}:${Math.round(audioDurationSec % 60).toString().padStart(2, '0')}`
            : 'full audio';
          appendLog(`Starting high-speed FFmpeg stream-loop muxing with full audio track (${durFmt})...`);

          // 5. High-speed FFmpeg Stream-Loop Muxing with Live Progress Logs
          let cleanBaseTitle = (job.headerTitle || 'Audiobook')
            .replace(/[\r\n]+/g, ' ')
            .replace(/[/\\:*?"<>|]/g, '')
            .trim();
          if (!cleanBaseTitle) cleanBaseTitle = 'Audiobook';
          // Ensure filename length does not exceed filesystem limit (APFS/NTFS max 255 bytes)
          if (cleanBaseTitle.length > 50) {
            cleanBaseTitle = cleanBaseTitle.substring(0, 50).trim();
          }

          ensureAudiobookDirs();
          let userTargetFilename = `${cleanBaseTitle}.mp4`;
          let userDownloadPath = path.join(USER_VIDEOS_DIR, userTargetFilename);
          if (fs.existsSync(userDownloadPath)) {
            let counter = 1;
            while (fs.existsSync(path.join(USER_VIDEOS_DIR, `${cleanBaseTitle} (${counter}).mp4`))) {
              counter++;
            }
            userTargetFilename = `${cleanBaseTitle} (${counter}).mp4`;
            userDownloadPath = path.join(USER_VIDEOS_DIR, userTargetFilename);
          }

          // Use raw safe title without encodeURI to avoid ENAMETOOLONG on disk (which caused FFmpeg exit code 193)
          const webSafeTitle = cleanBaseTitle.replace(/[/\\:*?"<>|]/g, '_').trim();
          const webOutputFilename = `Audiobook_${Date.now()}_${webSafeTitle || job.id}.mp4`;
          const finalOutputPath = path.join(publicDownloadsDir, webOutputFilename);
          const ffmpegPath = getFfmpegPath();

          await new Promise<void>((resolve, reject) => {
            const ffmpegArgs = [
              '-y',
              '-fflags', '+genpts',
              '-stream_loop', '-1',
              '-i', tempLoopPath,
              '-i', audioFilePath,
              '-map', '0:v:0',
              '-map', '1:a:0',
              '-c:v', 'copy',
              '-c:a', 'aac',
              '-b:a', '192k',
              '-shortest',
              '-movflags', '+faststart',
              '-progress', 'pipe:1',
              finalOutputPath,
            ];

            const child = spawn(ffmpegPath, ffmpegArgs);
            let lastReportedSec = 0;
            let ffmpegStderr = '';

            child.stdout.on('data', (chunk: Buffer) => {
              const text = chunk.toString();
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.startsWith('out_time=')) {
                  const timeVal = line.split('=')[1]?.trim();
                  const parts = timeVal?.split(':');
                  if (parts && parts.length >= 3) {
                    const curSec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
                    if (curSec - lastReportedSec >= 3 || (audioDurationSec > 0 && curSec >= audioDurationSec)) {
                      lastReportedSec = curSec;
                      const ratio = audioDurationSec > 0 ? Math.min(curSec / audioDurationSec, 1) : 0.5;
                      job.progress = 65 + Math.round(ratio * 30);
                      const curM = Math.floor(curSec / 60);
                      const curS = Math.floor(curSec % 60);
                      const curStr = `${curM}:${curS.toString().padStart(2, '0')}`;
                      const totM = Math.floor(audioDurationSec / 60);
                      const totS = Math.round(audioDurationSec % 60);
                      const totStr = `${totM}:${totS.toString().padStart(2, '0')}`;
                      const pct = Math.round(ratio * 100);
                      job.statusMessage = `Muxing full audio track: ${curStr} / ${totStr} (${pct}% complete)...`;
                      appendLog(`FFmpeg audio muxing: ${curStr} / ${totStr} (${pct}% complete)`);
                    }
                  }
                }
              }
            });

            child.stderr.on('data', (chunk: Buffer) => {
              const text = chunk.toString();
              ffmpegStderr += text;
              if (ffmpegStderr.length > 10000) {
                ffmpegStderr = ffmpegStderr.slice(-8000);
              }
            });

            child.on('close', (code) => {
              if (code === 0) {
                resolve();
              } else {
                const errorSnippet = ffmpegStderr
                  .split('\n')
                  .map(s => s.trim())
                  .filter((l) => l && !l.startsWith('frame=') && !l.startsWith('built with') && !l.startsWith('configuration:') && !l.startsWith('libav'))
                  .slice(-5)
                  .join(' | ');
                reject(new Error(`FFmpeg muxing exited with code ${code}${errorSnippet ? `: ${errorSnippet}` : ''}`));
              }
            });
            child.on('error', (err) => reject(err));
          });

          if (!fs.existsSync(finalOutputPath) || fs.statSync(finalOutputPath).size < 10000) {
            throw new Error('FFmpeg failed to create final audiobook video');
          }

          // Direct save to user's dedicated Audiobook Videos directory
          ensureAudiobookDirs();
          let finalLocalPath = finalOutputPath;
          try {
            fs.copyFileSync(finalOutputPath, userDownloadPath);
            if (fs.existsSync(userDownloadPath)) {
              finalLocalPath = userDownloadPath;
              appendLog(`Directly saved to system Downloads: ${userDownloadPath}`);
            }
          } catch (copyErr) {
            console.warn('[Direct Save to Downloads/Audiobook/Audiobook failed]', copyErr);
          }

          // Cleanup temporary loop video
          try { if (fs.existsSync(tempLoopPath)) fs.unlinkSync(tempLoopPath); } catch {}

          const finalSizeMb = (fs.statSync(finalOutputPath).size / (1024 * 1024)).toFixed(1);
          appendLog(`FFmpeg muxing finished successfully! Final MP4 size: ${finalSizeMb} MB`);
          appendLog(`🎉 Video render complete! Saved directly to disk.`);

          job.status = 'completed';
          job.progress = 100;
          job.outputPath = finalOutputPath;
          job.localFilePath = finalLocalPath;
          job.downloadUrl = `/downloads/${encodeURIComponent(webOutputFilename)}`;
          job.fileSizeBytes = fs.statSync(finalOutputPath).size;
          job.statusMessage = `Completed! Saved to Downloads/Audiobook/Audiobook/${path.basename(userDownloadPath)} (${finalSizeMb} MB).`;
          console.log(`[Audiobook Queue] 🎉 Render finished! File: ${finalLocalPath} (${finalSizeMb} MB)`);
        }

        async function processAudiobookQueue() {
          if ((globalThis as any).__isAudiobookQueueProcessing) return;
          const queue = getAudiobookQueue();
          const nextJob = queue.find(j => j.status === 'pending');
          if (!nextJob) return;

          (globalThis as any).__isAudiobookQueueProcessing = true;
          nextJob.status = 'rendering';
          nextJob.startedAt = Date.now();
          nextJob.progress = 5;
          nextJob.statusMessage = 'Starting rendering...';
          currentRenderingJob = nextJob;
          (globalThis as any).__currentAudiobookJob = nextJob;
          saveAudiobookQueue(queue);

          activeAudiobookJobs.set(nextJob.id, nextJob);

          try {
            await renderSingleAudiobookJob(nextJob);
            nextJob.status = 'completed';
            nextJob.progress = 100;
            nextJob.completedAt = Date.now();
            nextJob.statusMessage = 'Completed!';
          } catch (err: any) {
            nextJob.status = 'failed';
            nextJob.error = err.message || 'Render failed';
            nextJob.statusMessage = `Failed: ${nextJob.error}`;
          } finally {
            const updatedQueue = getAudiobookQueue().filter(j => j.id !== nextJob.id);
            saveAudiobookQueue(updatedQueue);

            const history = getAudiobookHistory().filter(h => h.id !== nextJob.id);
            history.unshift(nextJob);
            saveAudiobookHistory(history.slice(0, 100));

            activeAudiobookJobs.set(nextJob.id, nextJob);
            currentRenderingJob = null;
            (globalThis as any).__currentAudiobookJob = null;
            (globalThis as any).__isAudiobookQueueProcessing = false;

            setTimeout(() => {
              processAudiobookQueue().catch(e => console.error('[Queue runner error]', e));
            }, 1000);
          }
        }

        // Render cache endpoint
        if (url?.startsWith('/api/render-cache') && req.method === 'GET') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const filename = parsedUrl.searchParams.get('file');
          if (!filename || filename.includes('..') || filename.includes('/')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid filename' }));
            return;
          }
          const filePath = path.join(renderCacheDir, filename);
          if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Cached file not found' }));
            return;
          }
          const ext = path.extname(filename).toLowerCase();
          const contentType = ext === '.png' ? 'image/png' : (ext === '.wav' ? 'audio/wav' : (ext === '.mp3' ? 'audio/mpeg' : 'image/jpeg'));
          res.writeHead(200, { 'Content-Type': contentType });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        // POST /api/audiobook/start-render & POST /api/audiobook/queue-render
        if ((url === '/api/audiobook/start-render' || url === '/api/audiobook/queue-render') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              ensureAudiobookDirs();
              const payload = JSON.parse(body || '{}');
              const jobId = `audiobook_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const headerTitle = payload.headerTitle || 'Audiobook';
              const rawAudio = payload.audioFilePath || payload.audioPathOrBase64 || payload.audioUrl || payload.audioPathInput || '';
              const audioFilePath = typeof rawAudio === 'string' ? rawAudio.trim() : '';

              const newJob: AudiobookJobItem = {
                id: jobId,
                headerTitle: payload.headerTitle,
                subheader: payload.subheader,
                authorName: payload.authorName,
                episodeText: payload.episodeText,
                resolution: payload.resolution || '1080p',
                audioFilePath: audioFilePath,
                audioFileName: payload.audioFileName,
                audioDurationSec: payload.audioDurationSec,
                artworkUrl: payload.artworkUrl,
                artworkShape: payload.artworkShape,
                artworkWidth: payload.artworkWidth,
                logoUrl: payload.logoUrl,
                bgVideoUrl: payload.bgVideoUrl,
                themeId: payload.themeId || 'horror-halloween',
                gradientId: payload.gradientId,
                customGradient: payload.customGradient,
                headerTextColor: payload.headerTextColor,
                subheaderTextColor: payload.subheaderTextColor,
                authorTextColor: payload.authorTextColor,
                authorBgColor: payload.authorBgColor,
                episodeTextColor: payload.episodeTextColor,
                episodeBgColor: payload.episodeBgColor,
                headerFontSize: payload.headerFontSize,
                subheaderFontSize: payload.subheaderFontSize,
                authorFontSize: payload.authorFontSize,
                episodeFontSize: payload.episodeFontSize,
                status: 'pending',
                progress: 0,
                statusMessage: 'Queued for rendering...',
                createdAt: Date.now(),
                logs: [`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Job added to render queue.`],
              };

              const queue = getAudiobookQueue();
              queue.push(newJob);
              saveAudiobookQueue(queue);

              activeAudiobookJobs.set(jobId, newJob);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                jobId,
                status: 'pending',
                message: `Job queued successfully (${queue.length} in queue).`,
                queuePosition: queue.length,
              }));

              processAudiobookQueue().catch(err => {
                console.error('[Audiobook Queue Runner Error]', err);
              });
            } catch (err: any) {
              console.error('[Audiobook Queue Add Error]', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message || 'Failed to queue audiobook render' }));
            }
          });
          return;
        }

        // GET /api/audiobook/render-progress?jobId=...
        if (url?.startsWith('/api/audiobook/render-progress') && req.method === 'GET') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const jobId = parsedUrl.searchParams.get('jobId') || '';
          let job = activeAudiobookJobs.get(jobId);
          if (!job) {
            job = getAudiobookQueue().find(j => j.id === jobId);
          }
          if (!job) {
            job = getAudiobookHistory().find(j => j.id === jobId);
          }

          if (!job) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Audiobook job not found' }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(job));
          return;
        }

        // GET /api/audiobook/queue-status
        if (url?.startsWith('/api/audiobook/queue-status') && req.method === 'GET') {
          const queue = getAudiobookQueue();
          let activeJob = (globalThis as any).__currentAudiobookJob || currentRenderingJob;
          if (!activeJob) {
            activeJob = Array.from(activeAudiobookJobs.values()).find(j => j.status === 'rendering') || null;
          }
          if (!activeJob) {
            activeJob = queue.find(j => j.status === 'rendering') || null;
          }
          const pendingJobs = queue.filter(j => j.status === 'pending');
          const history = getAudiobookHistory();

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            activeJob,
            queue: pendingJobs,
            history,
            isProcessing: !!(globalThis as any).__isAudiobookQueueProcessing,
          }));
          return;
        }

        // POST /api/audiobook/cancel-queue-item
        if (url?.startsWith('/api/audiobook/cancel-queue-item') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { jobId } = JSON.parse(body || '{}');
              const queue = getAudiobookQueue();
              const target = queue.find(j => j.id === jobId);
              if (target && target.status === 'pending') {
                const updated = queue.filter(j => j.id !== jobId);
                saveAudiobookQueue(updated);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, cancelledId: jobId }));
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Job not found or already rendering' }));
              }
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        // POST /api/audiobook/clear-history
        if (url?.startsWith('/api/audiobook/clear-history') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { jobId, all } = JSON.parse(body || '{}');
              if (all) {
                saveAudiobookHistory([]);
              } else if (jobId) {
                const history = getAudiobookHistory().filter(h => h.id !== jobId);
                saveAudiobookHistory(history);
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        // GET /api/audiobook/history
        if (url?.startsWith('/api/audiobook/history') && req.method === 'GET') {
          const history = getAudiobookHistory();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, history }));
          return;
        }

        // POST /api/audiobook/upload-artwork
        if (url?.startsWith('/api/audiobook/upload-artwork') && req.method === 'POST') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const filename = decodeURIComponent(parsedUrl.searchParams.get('filename') || `artwork_${Date.now()}.png`);
          const targetDir = path.resolve(process.cwd(), 'public', 'downloads');
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

          const ext = path.extname(filename) || '.png';
          const sanitized = path.basename(filename, ext).replace(/[^a-zA-Z0-9_\u1000-\u109F]/g, '_').substring(0, 40);
          const targetFilename = `artwork_${Date.now()}_${sanitized}${ext}`;
          const targetPath = path.join(targetDir, targetFilename);
          const fileWriteStream = fs.createWriteStream(targetPath);

          req.pipe(fileWriteStream);
          fileWriteStream.on('finish', () => {
            const clientUrl = `/downloads/${targetFilename}`;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              url: clientUrl,
              filePath: targetPath,
              fileName: targetFilename,
            }));
          });
          fileWriteStream.on('error', (err: any) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message || 'Artwork upload failed' }));
          });
          return;
        }

        // POST /api/audiobook/copy-local-image
        if (url?.startsWith('/api/audiobook/copy-local-image') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filePath } = JSON.parse(body || '{}');
              const cleanPath = cleanPlatformPath(filePath || '');
              if (!cleanPath || !fs.existsSync(cleanPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Local file not found' }));
                return;
              }
              const targetDir = path.resolve(process.cwd(), 'public', 'downloads');
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

              const ext = path.extname(cleanPath) || '.png';
              const targetFilename = `artwork_${Date.now()}_${path.basename(cleanPath, ext).replace(/[^a-zA-Z0-9_]/g, '_')}${ext}`;
              const targetPath = path.join(targetDir, targetFilename);
              fs.copyFileSync(cleanPath, targetPath);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                url: `/downloads/${targetFilename}`,
                filePath: targetPath,
                fileName: targetFilename,
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // GET /api/audiobook/render-download?jobId=...
        if (url?.startsWith('/api/audiobook/render-download') && req.method === 'GET') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const jobId = parsedUrl.searchParams.get('jobId') || '';
          const job = activeAudiobookJobs.get(jobId);

          if (!job || !job.outputPath || !fs.existsSync(job.outputPath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Audiobook video file not found or expired');
            return;
          }

          res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': fs.statSync(job.outputPath).size,
            'Content-Disposition': `attachment; filename="${path.basename(job.outputPath)}"`,
          });
          fs.createReadStream(job.outputPath).pipe(res);
          return;
        }

        // POST & GET /api/audiobook/inspect-audio
        if ((url === '/api/audiobook/inspect-audio' && req.method === 'POST') || (url?.startsWith('/api/audiobook/inspect-audio') && req.method === 'GET')) {
          const handleInspect = (rawPath: string) => {
            try {
              if (!rawPath || !rawPath.trim()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'File path ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်' }));
                return;
              }

              const cleaned = cleanPlatformPath(rawPath);
              let targetPath = cleaned;
              if (!fs.existsSync(targetPath)) {
                const rel = path.resolve(process.cwd(), cleaned);
                if (fs.existsSync(rel)) targetPath = rel;
              }

              if (!targetPath || !fs.existsSync(targetPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  error: `ဖိုင်တည်နေရာ ရှာမတွေ့ပါ: ${rawPath}`,
                }));
                return;
              }

              const stat = fs.statSync(targetPath);
              if (stat.isDirectory()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Folder ဖြစ်နေပါသည်၊ Audio ဖိုင်ကို ရွေးချယ်ပေးပါ' }));
                return;
              }

              const ffprobePath = getFfprobePath();
              const probeCmd = `"${ffprobePath}" -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,channels,sample_rate -of json "${targetPath}"`;
              const probeOutput = execSync(probeCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
              const probeData = JSON.parse(probeOutput);

              const durationSecRaw = parseFloat(probeData.format?.duration || probeData.streams?.[0]?.duration || '0');
              const durationSec = Math.round(durationSecRaw);
              const hrs = Math.floor(durationSec / 3600);
              const mins = Math.floor((durationSec % 3600) / 60);
              const secs = durationSec % 60;
              const formattedDuration = hrs > 0
                ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : `${mins}:${secs.toString().padStart(2, '0')}`;

              const fileName = path.basename(targetPath);
              const streamUrl = `/api/audiobook/audio-file?path=${encodeURIComponent(targetPath)}`;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                filePath: targetPath,
                fileName,
                fileSizeBytes: stat.size,
                duration: durationSecRaw,
                durationSec,
                formattedDuration,
                streamUrl,
                codec: probeData.streams?.[0]?.codec_name || 'unknown',
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Audio file စစ်ဆေး၍ မရပါ' }));
            }
          };

          if (req.method === 'GET') {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
            handleInspect(parsedUrl.searchParams.get('path') || '');
          } else {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { filePath } = JSON.parse(body || '{}');
                handleInspect(filePath || '');
              } catch (e: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
              }
            });
          }
          return;
        }

        // GET /api/audiobook/audio-file?path=... (HTTP 206 Partial Content Audio Streaming)
        if (url?.startsWith('/api/audiobook/audio-file') && (req.method === 'GET' || req.method === 'HEAD')) {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const rawPath = parsedUrl.searchParams.get('path') || '';
          const cleaned = cleanPlatformPath(rawPath);
          let targetPath = cleaned;
          if (!fs.existsSync(targetPath)) {
            const rel = path.resolve(process.cwd(), cleaned);
            if (fs.existsSync(rel)) targetPath = rel;
          }

          if (!targetPath || !fs.existsSync(targetPath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Audio file not found' }));
            return;
          }

          const stat = fs.statSync(targetPath);
          const fileSize = stat.size;
          const ext = path.extname(targetPath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.m4a': 'audio/mp4',
            '.mp4': 'audio/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.flac': 'audio/flac',
          };
          const contentType = mimeTypes[ext] || 'audio/mpeg';

          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize,
              'Content-Type': contentType,
            });
            if (req.method === 'HEAD') {
              res.end();
            } else {
              const fileStream = fs.createReadStream(targetPath, { start, end });
              fileStream.pipe(res);
            }
          } else {
            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes',
            });
            if (req.method === 'HEAD') {
              res.end();
            } else {
              fs.createReadStream(targetPath).pipe(res);
            }
          }
          return;
        }

        // POST /api/audiobook/upload-audio?filename=...
        if (url?.startsWith('/api/audiobook/upload-audio') && req.method === 'POST') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const filename = decodeURIComponent(parsedUrl.searchParams.get('filename') || `audio_${Date.now()}.m4a`);
          const tempDir = path.resolve(process.cwd(), 'data', 'audiobook_temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

          const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
          const targetPath = path.join(tempDir, `up_${Date.now()}_${sanitized}`);
          const fileWriteStream = fs.createWriteStream(targetPath);

          req.pipe(fileWriteStream);
          fileWriteStream.on('finish', () => {
            try {
              const stat = fs.statSync(targetPath);
              const ffprobePath = getFfprobePath();
              const probeCmd = `"${ffprobePath}" -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,channels,sample_rate -of json "${targetPath}"`;
              const probeOutput = execSync(probeCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
              const probeData = JSON.parse(probeOutput);
              const durationSecRaw = parseFloat(probeData.format?.duration || probeData.streams?.[0]?.duration || '0');
              const durationSec = Math.round(durationSecRaw);
              const hrs = Math.floor(durationSec / 3600);
              const mins = Math.floor((durationSec % 3600) / 60);
              const secs = durationSec % 60;
              const formattedDuration = hrs > 0
                ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : `${mins}:${secs.toString().padStart(2, '0')}`;

              const streamUrl = `/api/audiobook/audio-file?path=${encodeURIComponent(targetPath)}`;

              ensureAudiobookDirs();
              const uploadCopy = path.join(USER_YT_DOWNLOADS_DIR, path.basename(targetPath));
              try { fs.copyFileSync(targetPath, uploadCopy); } catch {}

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                filePath: targetPath,
                fileName: filename,
                fileSizeBytes: stat.size,
                duration: durationSecRaw,
                durationSec,
                formattedDuration,
                streamUrl,
                codec: probeData.streams?.[0]?.codec_name || 'unknown',
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Failed to inspect uploaded audio' }));
            }
          });
          fileWriteStream.on('error', (err: any) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message || 'File upload failed' }));
          });
          return;
        }

        // Custom Background Video Presets Management
        const CUSTOM_BG_PRESETS_FILE = path.resolve(process.cwd(), 'data', 'audiobook_temp', 'custom_background_presets.json');

        interface CustomBackgroundPreset {
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

        function loadCustomBgPresets(): CustomBackgroundPreset[] {
          try {
            if (!fs.existsSync(CUSTOM_BG_PRESETS_FILE)) return [];
            return JSON.parse(fs.readFileSync(CUSTOM_BG_PRESETS_FILE, 'utf-8'));
          } catch {
            return [];
          }
        }

        function saveCustomBgPresets(presets: CustomBackgroundPreset[]) {
          try {
            const dir = path.dirname(CUSTOM_BG_PRESETS_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(CUSTOM_BG_PRESETS_FILE, JSON.stringify(presets, null, 2), 'utf-8');
          } catch (err) {
            console.error('[Error saving custom background presets]', err);
          }
        }

        function syncCustomBgPresets(): CustomBackgroundPreset[] {
          const presets = loadCustomBgPresets();
          const bgDir = path.resolve(process.cwd(), 'public', 'backgrounds');
          if (fs.existsSync(bgDir)) {
            const files = fs.readdirSync(bgDir);
            let changed = false;
            for (const f of files) {
              if ((f.startsWith('loop_custom_') || f.startsWith('custom_stock_')) && f.endsWith('.mp4')) {
                const fullPath = path.join(bgDir, f);
                const videoUrl = `/backgrounds/${f}`;
                const already = presets.find(p => p.videoUrl === videoUrl || p.localPath === fullPath);
                if (!already) {
                  const stat = fs.statSync(fullPath);
                  presets.push({
                    id: `bg_${f.replace(/\.[^/.]+$/, '')}`,
                    nameMm: `စိတ်ကြိုက် ဗီဒီယို #${presets.length + 1}`,
                    nameEn: `Custom Preset #${presets.length + 1}`,
                    genreSuggestionMm: 'သိမ်းဆည်းထားသော Background Video',
                    videoUrl,
                    localPath: fullPath,
                    fileSizeBytes: stat.size,
                    durationSec: 20,
                    createdAt: stat.mtimeMs || Date.now(),
                  });
                  changed = true;
                }
              }
            }
            if (changed) {
              saveCustomBgPresets(presets);
            }
          }
          return presets.sort((a, b) => b.createdAt - a.createdAt);
        }

        // POST /api/audiobook/download-video-link
        if (url?.startsWith('/api/audiobook/download-video-link') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { url: videoUrl } = JSON.parse(body || '{}');
              if (!videoUrl || !videoUrl.trim()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Video URL မထည့်ရသေးပါ (Please enter video URL)' }));
                return;
              }

              const targetDir = path.resolve(process.cwd(), 'public', 'backgrounds');
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

              const rawFilename = `raw_custom_${Date.now()}.mp4`;
              const rawPath = path.join(targetDir, rawFilename);
              const trimmedUrl = videoUrl.trim();
              let downloaded = false;

              const ytdlpPath = getYtDlpPath();
              const ffmpegPath = getFfmpegPath();
              const ffprobePath = getFfprobePath();

              try {
                const ytdlpImpersonateCmd = `"${ytdlpPath}" --extractor-args "generic:impersonate" -f "bestvideo[ext=mp4]/best[ext=mp4]/best" --no-playlist -o "${rawPath}" "${trimmedUrl}"`;
                execSync(ytdlpImpersonateCmd, { stdio: 'pipe', timeout: 120000 });
                if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 10000) {
                  downloaded = true;
                }
              } catch (ytdlpErr) {
                console.warn('[Video Download] yt-dlp impersonate failed, trying standard yt-dlp:', ytdlpErr);
                try {
                  const ytdlpCmd = `"${ytdlpPath}" -f "bestvideo[ext=mp4]/best[ext=mp4]/best" --no-playlist -o "${rawPath}" "${trimmedUrl}"`;
                  execSync(ytdlpCmd, { stdio: 'pipe', timeout: 120000 });
                  if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 10000) {
                    downloaded = true;
                  }
                } catch (stdErr) {
                  console.warn('[Video Download] standard yt-dlp failed:', stdErr);
                }
              }

              if (!downloaded) {
                try {
                  const curlCmd = `curl -L -f -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" -o "${rawPath}" "${trimmedUrl}"`;
                  execSync(curlCmd, { stdio: 'pipe', timeout: 120000 });
                  if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 10000) {
                    downloaded = true;
                  }
                } catch (curlErr) {
                  console.warn('[Video Download] curl direct download failed:', curlErr);
                }
              }

              if (!downloaded || !fs.existsSync(rawPath) || fs.statSync(rawPath).size < 10000) {
                throw new Error('Video download မအောင်မြင်ပါ။ Pexels, Pixabay သို့မဟုတ် direct MP4 link ဖြစ်မဖြစ် စစ်ဆေးပေးပါ');
              }

              const probeCmd = `"${ffprobePath}" -v error -show_entries format=duration,size -show_entries stream=width,height,duration -of json "${rawPath}"`;
              const probeOutput = execSync(probeCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
              const probeData = JSON.parse(probeOutput);
              const durationSecRaw = parseFloat(probeData.format?.duration || probeData.streams?.[0]?.duration || '10');
              const width = probeData.streams?.[0]?.width || 1920;
              const height = probeData.streams?.[0]?.height || 1080;

              const clipDuration = Math.max(Math.min(Math.floor(durationSecRaw), 10), 2);
              const loopFilename = `loop_custom_${Date.now()}.mp4`;
              const loopPath = path.join(targetDir, loopFilename);

              try {
                const pingPongCmd = `"${ffmpegPath}" -y -ss 0 -t ${clipDuration} -i "${rawPath}" -filter_complex "[0:v]split=2[fwd][rev_in];[rev_in]reverse[rev];[fwd][rev]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -pix_fmt yuv420p -an "${loopPath}"`;
                execSync(pingPongCmd, { stdio: 'pipe', timeout: 120000 });
                if (fs.existsSync(loopPath) && fs.statSync(loopPath).size > 10000) {
                  try { fs.unlinkSync(rawPath); } catch {}

                  const existingPresets = loadCustomBgPresets();
                  const presetId = `preset_custom_${Date.now()}`;
                  const newPreset: CustomBackgroundPreset = {
                    id: presetId,
                    nameMm: `စိတ်ကြိုက် Loop #${existingPresets.length + 1}`,
                    nameEn: `Custom Preset #${existingPresets.length + 1}`,
                    genreSuggestionMm: 'အင်တာနက်မှ ဒေါင်းလုဒ်လုပ်ထားသော Background Loop',
                    videoUrl: `/backgrounds/${loopFilename}`,
                    localPath: loopPath,
                    fileSizeBytes: fs.statSync(loopPath).size,
                    durationSec: clipDuration * 2,
                    createdAt: Date.now(),
                  };
                  existingPresets.unshift(newPreset);
                  saveCustomBgPresets(existingPresets);

                  ensureAudiobookDirs();
                  const userBgPath = path.join(USER_BG_VIDEOS_DIR, loopFilename);
                  try { fs.copyFileSync(loopPath, userBgPath); } catch {}

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: true,
                    videoUrl: `/backgrounds/${loopFilename}`,
                    localPath: loopPath,
                    fileName: loopFilename,
                    durationSec: clipDuration * 2,
                    width,
                    height,
                    fileSizeBytes: fs.statSync(loopPath).size,
                    isLoop: true,
                    preset: newPreset,
                    presets: existingPresets,
                  }));
                  return;
                }
              } catch (loopErr) {
                console.warn('[Ping-Pong Loop FFmpeg Error, falling back to raw video]', loopErr);
              }

              const existingPresets = loadCustomBgPresets();
              const presetId = `preset_custom_${Date.now()}`;
              const newPreset: CustomBackgroundPreset = {
                id: presetId,
                nameMm: `စိတ်ကြိုက် Loop #${existingPresets.length + 1}`,
                nameEn: `Custom Preset #${existingPresets.length + 1}`,
                genreSuggestionMm: 'အင်တာနက်မှ ဒေါင်းလုဒ်လုပ်ထားသော Background Video',
                videoUrl: `/backgrounds/${rawFilename}`,
                localPath: rawPath,
                fileSizeBytes: fs.statSync(rawPath).size,
                durationSec: Math.round(durationSecRaw),
                createdAt: Date.now(),
              };
              existingPresets.unshift(newPreset);
              saveCustomBgPresets(existingPresets);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                videoUrl: `/backgrounds/${rawFilename}`,
                localPath: rawPath,
                fileName: rawFilename,
                durationSec: Math.round(durationSecRaw),
                width,
                height,
                fileSizeBytes: fs.statSync(rawPath).size,
                preset: newPreset,
                presets: existingPresets,
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Video download failed' }));
            }
          });
          return;
        }

        // POST /api/audiobook/upload-video?filename=...
        if (url?.startsWith('/api/audiobook/upload-video') && req.method === 'POST') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const filename = decodeURIComponent(parsedUrl.searchParams.get('filename') || `custom_vid_${Date.now()}.mp4`);
          const targetDir = path.resolve(process.cwd(), 'public', 'backgrounds');
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

          const rawPath = path.join(targetDir, `raw_upload_${Date.now()}.mp4`);
          const fileWriteStream = fs.createWriteStream(rawPath);

          req.pipe(fileWriteStream);
          fileWriteStream.on('finish', () => {
            try {
              const ffprobePath = getFfprobePath();
              const ffmpegPath = getFfmpegPath();

              const probeCmd = `"${ffprobePath}" -v error -show_entries format=duration,size -show_entries stream=width,height,duration -of json "${rawPath}"`;
              const probeOutput = execSync(probeCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
              const probeData = JSON.parse(probeOutput);
              const durationSecRaw = parseFloat(probeData.format?.duration || probeData.streams?.[0]?.duration || '10');
              const width = probeData.streams?.[0]?.width || 1920;
              const height = probeData.streams?.[0]?.height || 1080;

              const clipDuration = Math.max(Math.min(Math.floor(durationSecRaw), 10), 2);
              const loopFilename = `loop_custom_${Date.now()}.mp4`;
              const loopPath = path.join(targetDir, loopFilename);

              const pingPongCmd = `"${ffmpegPath}" -y -ss 0 -t ${clipDuration} -i "${rawPath}" -filter_complex "[0:v]split=2[fwd][rev_in];[rev_in]reverse[rev];[fwd][rev]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -pix_fmt yuv420p -an "${loopPath}"`;
              execSync(pingPongCmd, { stdio: 'pipe', timeout: 120000 });

              if (fs.existsSync(loopPath) && fs.statSync(loopPath).size > 10000) {
                try { fs.unlinkSync(rawPath); } catch {}

                const existingPresets = loadCustomBgPresets();
                const presetId = `preset_custom_${Date.now()}`;
                const newPreset: CustomBackgroundPreset = {
                  id: presetId,
                  nameMm: `တင်ထားသော ဗီဒီယို #${existingPresets.length + 1}`,
                  nameEn: `Custom Upload #${existingPresets.length + 1}`,
                  genreSuggestionMm: 'မိမိ စက်မှ Upload တင်ထားသော Background Loop',
                  videoUrl: `/backgrounds/${loopFilename}`,
                  localPath: loopPath,
                  fileSizeBytes: fs.statSync(loopPath).size,
                  durationSec: clipDuration * 2,
                  createdAt: Date.now(),
                };
                existingPresets.unshift(newPreset);
                saveCustomBgPresets(existingPresets);

                ensureAudiobookDirs();
                const userBgPath = path.join(USER_BG_VIDEOS_DIR, loopFilename);
                try { fs.copyFileSync(loopPath, userBgPath); } catch {}

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  videoUrl: `/backgrounds/${loopFilename}`,
                  localPath: loopPath,
                  fileName: loopFilename,
                  durationSec: clipDuration * 2,
                  width,
                  height,
                  fileSizeBytes: fs.statSync(loopPath).size,
                  isLoop: true,
                  preset: newPreset,
                  presets: existingPresets,
                }));
                return;
              }

              const existingPresets = loadCustomBgPresets();
              const presetId = `preset_custom_${Date.now()}`;
              const newPreset: CustomBackgroundPreset = {
                id: presetId,
                nameMm: `တင်ထားသော ဗီဒီယို #${existingPresets.length + 1}`,
                nameEn: `Custom Upload #${existingPresets.length + 1}`,
                genreSuggestionMm: 'မိမိ စက်မှ Upload တင်ထားသော Background Video',
                videoUrl: `/backgrounds/${path.basename(rawPath)}`,
                localPath: rawPath,
                fileName: path.basename(rawPath),
                durationSec: Math.round(durationSecRaw),
                createdAt: Date.now(),
              };
              existingPresets.unshift(newPreset);
              saveCustomBgPresets(existingPresets);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                videoUrl: `/backgrounds/${path.basename(rawPath)}`,
                localPath: rawPath,
                fileName: path.basename(rawPath),
                durationSec: Math.round(durationSecRaw),
                width,
                height,
                fileSizeBytes: fs.statSync(rawPath).size,
                preset: newPreset,
                presets: existingPresets,
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Video processing failed' }));
            }
          });
          fileWriteStream.on('error', (err: any) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message || 'File upload failed' }));
          });
          return;
        }

        // GET /api/audiobook/background-presets
        if (url?.startsWith('/api/audiobook/background-presets') && req.method === 'GET') {
          try {
            const presets = syncCustomBgPresets();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, presets }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message || 'Failed to list background presets' }));
          }
          return;
        }

        // DELETE /api/audiobook/background-presets
        if (url?.startsWith('/api/audiobook/background-presets') && req.method === 'DELETE') {
          const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
          const presetId = parsedUrl.searchParams.get('id');
          try {
            const presets = loadCustomBgPresets();
            const target = presets.find(p => p.id === presetId);
            const remaining = presets.filter(p => p.id !== presetId);
            saveCustomBgPresets(remaining);

            if (target?.localPath && fs.existsSync(target.localPath) && target.localPath.includes('loop_custom_')) {
              try { fs.unlinkSync(target.localPath); } catch {}
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, presets: remaining }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message || 'Failed to delete preset' }));
          }
          return;
        }

        // POST /api/audiobook/open-in-finder (Cross-platform reveal)
        if (url?.startsWith('/api/audiobook/open-in-finder') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filePath } = JSON.parse(body || '{}');
              const target = cleanPlatformPath(filePath || '');
              if (target && fs.existsSync(target)) {
                revealFileInOS(target);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, filePath: target }));
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'File not found' }));
              }
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        // POST /api/audiobook/open-folder (Cross-platform folder opening)
        if (url?.startsWith('/api/audiobook/open-folder') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              ensureAudiobookDirs();
              const { folderType } = JSON.parse(body || '{}');
              let targetDir = USER_VIDEOS_DIR;
              if (folderType === 'audiobook') targetDir = USER_VIDEOS_DIR;
              else if (folderType === 'thumbnails') targetDir = USER_THUMBNAILS_DIR;
              else if (folderType === 'youtube') targetDir = USER_YT_DOWNLOADS_DIR;
              else if (folderType === 'ai') targetDir = USER_AI_GEN_DIR;
              else if (folderType === 'bg') targetDir = USER_BG_VIDEOS_DIR;

              if (fs.existsSync(targetDir)) {
                openFolderInOS(targetDir);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, folder: targetDir }));
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Directory not found' }));
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // POST /api/audiobook/generate-thumbnail (1080p Full HD thumbnail generator)
        if (url === '/api/audiobook/generate-thumbnail' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              ensureAudiobookDirs();
              const payload = JSON.parse(body || '{}');
              const { renderStill, selectComposition } = await import('@remotion/renderer');
              const bundleLocation = await getOrCreateBundle();
              const chromeExecutable = getSystemChromeExecutable();

              let cleanTitle = (payload.headerTitle || 'Audiobook')
                .replace(/[\r\n]+/g, ' ')
                .replace(/[/\\:*?"<>|]/g, '')
                .trim();
              if (!cleanTitle) cleanTitle = 'Audiobook';
              const timestamp = Date.now();
              const layoutId = payload.layoutId || 'layout-1-split';
              const outFilename = `Thumbnail_${cleanTitle}_${layoutId}_1080p_${timestamp}.png`;

              const publicDownloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
              if (!fs.existsSync(publicDownloadsDir)) fs.mkdirSync(publicDownloadsDir, { recursive: true });
              const webOutputPath = path.join(publicDownloadsDir, outFilename);
              const localOutputPath = path.join(USER_THUMBNAILS_DIR, outFilename);

              const composition = await selectComposition({
                serveUrl: bundleLocation,
                id: 'AudiobookThumbnail',
                inputProps: {
                  headerTitle: payload.headerTitle || 'Audiobook',
                  subheader: payload.subheader || '',
                  authorName: payload.authorName || '',
                  episodeText: payload.episodeText || 'အစအဆုံး',
                  headerFontSize: Number(payload.headerFontSize) || undefined,
                  subheaderFontSize: Number(payload.subheaderFontSize) || undefined,
                  authorFontSize: Number(payload.authorFontSize) || undefined,
                  episodeFontSize: Number(payload.episodeFontSize) || undefined,
                  artworkUrl: payload.artworkUrl ? cacheBase64ToDisk(payload.artworkUrl, 'artwork') : '',
                  artworkShape: payload.artworkShape || 'book-cover',
                  themeId: payload.themeId || 'horror-halloween',
                  gradientId: payload.gradientId,
                  customGradient: payload.customGradient,
                  bgVideoUrl: payload.bgVideoUrl,
                  headerTextColor: payload.headerTextColor,
                  subheaderTextColor: payload.subheaderTextColor,
                  authorTextColor: payload.authorTextColor,
                  authorBgColor: payload.authorBgColor,
                  episodeTextColor: payload.episodeTextColor,
                  episodeBgColor: payload.episodeBgColor,
                  layoutId: layoutId,
                },
              });

              composition.width = 1920;
              composition.height = 1080;

              await renderStill({
                composition,
                serveUrl: bundleLocation,
                frame: 0,
                output: webOutputPath,
                imageFormat: 'png',
              });

              try {
                fs.copyFileSync(webOutputPath, localOutputPath);
              } catch (copyErr) {
                console.warn('[Direct Thumbnail Save failed]', copyErr);
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                filename: outFilename,
                downloadUrl: `/downloads/${outFilename}`,
                localFilePath: localOutputPath,
              }));
            } catch (err: any) {
              console.error('[Generate Thumbnail Error]', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Thumbnail generation failed' }));
            }
          });
          return;
        }

        // POST /api/audiobook/play-video (Cross-platform video playback)
        if (url?.startsWith('/api/audiobook/play-video') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filePath } = JSON.parse(body || '{}');
              const target = cleanPlatformPath(filePath || '');
              if (target && fs.existsSync(target)) {
                playVideoInOS(target);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, filePath: target }));
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'File not found' }));
              }
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        const AUDIO_LINK_CACHE_FILE = path.resolve(process.cwd(), 'data', 'audiobook_temp', 'audio_link_cache.json');

        function getAudioLinkCache(): Record<string, any> {
          try {
            if (fs.existsSync(AUDIO_LINK_CACHE_FILE)) {
              return JSON.parse(fs.readFileSync(AUDIO_LINK_CACHE_FILE, 'utf-8'));
            }
          } catch {}
          return {};
        }

        function saveAudioLinkCache(cache: Record<string, any>) {
          try {
            const dir = path.dirname(AUDIO_LINK_CACHE_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(AUDIO_LINK_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
          } catch (err) {
            console.warn('[Cache Save Error]', err);
          }
        }

        function normalizeAudioUrlKey(rawUrl: string): string {
          try {
            const u = new URL(rawUrl.trim());
            if (u.hostname.includes('youtube.com')) {
              const v = u.searchParams.get('v');
              if (v) return `https://www.youtube.com/watch?v=${v}`;
            } else if (u.hostname.includes('youtu.be')) {
              const id = u.pathname.replace(/^\//, '').split('?')[0];
              if (id) return `https://www.youtube.com/watch?v=${id}`;
            }
            return `${u.origin}${u.pathname}`;
          } catch {}
          return rawUrl.trim();
        }

        // POST /api/audiobook/download-link
        if (url === '/api/audiobook/download-link' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { url: audioLink } = JSON.parse(body || '{}');
              if (!audioLink || typeof audioLink !== 'string' || !audioLink.trim()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Audio URL is required' }));
                return;
              }

              const cleanUrl = audioLink.trim();
              const tempDir = path.resolve(process.cwd(), 'data', 'audiobook_temp');
              if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

              const ytIdMatch = cleanUrl.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/|\/v\/|\/live\/)([a-zA-Z0-9_-]{11})/);
              const ytVideoId = ytIdMatch ? ytIdMatch[1] : null;

              const cacheKey = normalizeAudioUrlKey(cleanUrl);
              const linkCache = getAudioLinkCache();
              if (linkCache[cacheKey] && linkCache[cacheKey].filePath && fs.existsSync(linkCache[cacheKey].filePath)) {
                const cached = linkCache[cacheKey];
                if (ytVideoId && !cached.filePath.includes(ytVideoId) && !cached.fileName?.includes(ytVideoId)) {
                  console.warn(`[Audiobook Cache] ⚠️ Mismatched cache entry detected for ${cacheKey}. Invalidating bad mapping.`);
                  delete linkCache[cacheKey];
                  saveAudioLinkCache(linkCache);
                } else {
                  console.log(`[Audiobook Cache] ⚡ Instant verified hit for URL ${cacheKey}: ${cached.filePath}`);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: true,
                    ...cached,
                    fromCache: true,
                  }));
                  return;
                }
              }

              const isYouTube = /(?:youtube\.com\/(?:watch|shorts|live|embed)|youtu\.be\/)/i.test(cleanUrl);
              const ytDlpPath = getYtDlpPath();
              const ffprobePath = getFfprobePath();
              let downloadedFilePath = '';
              let detectedTitle = '';
              let ytDlpErrorMsg = '';

              if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
                try {
                  const urlObj = new URL(cleanUrl);
                  if (urlObj.pathname.startsWith('/downloads/')) {
                    const localPath = path.resolve(process.cwd(), 'public', urlObj.pathname.replace(/^\//, ''));
                    if (fs.existsSync(localPath)) {
                      downloadedFilePath = localPath;
                      detectedTitle = path.basename(localPath);
                    }
                  }
                } catch {}
              }

              if (!downloadedFilePath) {
                if (isYouTube) {
                  const outTemplate = path.join(tempDir, `yt_${Date.now()}_%(id)s.%(ext)s`);
                  const ytdlCmd = `"${ytDlpPath}" --extractor-args "youtube:player_client=android,web" -x --audio-format m4a --no-playlist -o "${outTemplate}" --print title --print after_move:filepath "${cleanUrl}"`;
                  
                  try {
                    const output = execSync(ytdlCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
                    const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
                    
                    for (const line of lines) {
                      if (fs.existsSync(line)) {
                        downloadedFilePath = line;
                      } else if (!detectedTitle && !line.startsWith('[') && !line.startsWith('WARNING') && !line.startsWith('Deprecated') && !line.includes('urllib3')) {
                        detectedTitle = line;
                      }
                    }
                  } catch (ytdlErr: any) {
                    const errText = (ytdlErr.stderr?.toString() || ytdlErr.stdout?.toString() || ytdlErr.message || '').trim();
                    console.warn('[yt-dlp extraction warning]', errText);
                    ytDlpErrorMsg = errText;
                  }

                  if (!downloadedFilePath && ytVideoId) {
                    const matchingFiles = fs.readdirSync(tempDir)
                      .filter(f => f.startsWith('yt_') && f.includes(ytVideoId) && (f.endsWith('.m4a') || f.endsWith('.opus') || f.endsWith('.mp3')))
                      .map(f => ({ name: f, path: path.join(tempDir, f), mtime: fs.statSync(path.join(tempDir, f)).mtimeMs }))
                      .sort((a, b) => b.mtime - a.mtime);
                    if (matchingFiles.length > 0) {
                      downloadedFilePath = matchingFiles[0].path;
                    }
                  }
                } else {
                  let isDirectAudioFile = false;
                  let extMatch = '.m4a';
                  try {
                    const parsed = new URL(cleanUrl);
                    const rawExt = (path.extname(parsed.pathname) || '').toLowerCase();
                    if (['.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac', '.m4b'].includes(rawExt)) {
                      isDirectAudioFile = true;
                      extMatch = rawExt;
                      detectedTitle = path.basename(parsed.pathname, rawExt) || 'Web Audio';
                    }
                  } catch {}

                  if (isDirectAudioFile) {
                    const targetPath = path.join(tempDir, `direct_${Date.now()}${extMatch}`);
                    execSync(`curl -L -s -m 60 -o "${targetPath}" "${cleanUrl}"`);
                    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
                      downloadedFilePath = targetPath;
                    }
                  } else {
                    const outTemplate = path.join(tempDir, `audio_${Date.now()}_%(id)s.%(ext)s`);
                    try {
                      const ytdlCmd = `"${ytDlpPath}" -x --audio-format m4a --no-playlist -o "${outTemplate}" --print title --print after_move:filepath "${cleanUrl}"`;
                      const output = execSync(ytdlCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
                      const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
                      for (const line of lines) {
                        if (fs.existsSync(line)) {
                          downloadedFilePath = line;
                        } else if (!detectedTitle && !line.startsWith('[') && !line.startsWith('WARNING')) {
                          detectedTitle = line;
                        }
                      }
                    } catch (gErr: any) {
                      ytDlpErrorMsg = (gErr.stderr?.toString() || gErr.message || '').trim();
                      const targetPath = path.join(tempDir, `direct_${Date.now()}.m4a`);
                      execSync(`curl -L -s -m 120 -o "${targetPath}" "${cleanUrl}"`);
                      if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
                        downloadedFilePath = targetPath;
                        detectedTitle = 'Web Audio';
                      }
                    }
                  }
                }
              }

              if (!downloadedFilePath || !fs.existsSync(downloadedFilePath)) {
                let userFriendlyError = 'YouTube / Web link မှ အသံဖိုင် ဒေါင်းလုဒ်ဆွဲ၍ မရပါ';
                if (ytDlpErrorMsg.includes('Private video')) {
                  userFriendlyError = 'ဤ YouTube ဗီဒီယိုသည် Private Video (ကိုယ်ပိုင်သီးသန့်) ဖြစ်နေသဖြင့် ဒေါင်းလုဒ်ဆွဲ၍ မရပါခင်ဗျာ (Public ဖြစ်သော link ကို စစ်ဆေးထည့်သွင်းပေးပါ)';
                } else if (ytDlpErrorMsg.includes('Sign in to confirm you’re not a bot') || ytDlpErrorMsg.includes('Sign in')) {
                  userFriendlyError = 'YouTube မှ Sign-in အကောင့် authentication တောင်းဆိုနေပါသည်';
                } else if (ytDlpErrorMsg.includes('Video unavailable')) {
                  userFriendlyError = 'ဤ YouTube ဗီဒီယို မရှိတော့ပါ သို့မဟုတ် ဖျက်ထားခြင်း ဖြစ်နိုင်ပါသည် (Video unavailable)';
                } else if (ytDlpErrorMsg) {
                  const firstErr = ytDlpErrorMsg.split('\n').find((l: string) => l.includes('ERROR:')) || ytDlpErrorMsg.slice(0, 160);
                  userFriendlyError += `: ${firstErr.replace(/^ERROR:\s*/, '')}`;
                }
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: userFriendlyError }));
                return;
              }

              const probeCmd = `"${ffprobePath}" -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,channels,sample_rate -of json "${downloadedFilePath}"`;
              const probeOutput = execSync(probeCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
              const probeData = JSON.parse(probeOutput);
              const durationSecRaw = parseFloat(probeData.format?.duration || probeData.streams?.[0]?.duration || '0');
              const durationSec = Math.round(durationSecRaw);
              const hrs = Math.floor(durationSec / 3600);
              const mins = Math.floor((durationSec % 3600) / 60);
              const secs = durationSec % 60;
              const formattedDuration = hrs > 0
                ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : `${mins}:${secs.toString().padStart(2, '0')}`;

              const streamUrl = `/api/audiobook/audio-file?path=${encodeURIComponent(downloadedFilePath)}`;

              linkCache[cacheKey] = {
                filePath: downloadedFilePath,
                fileName: path.basename(downloadedFilePath),
                title: detectedTitle || path.basename(downloadedFilePath),
                duration: durationSecRaw,
                durationSec,
                formattedDuration,
                streamUrl,
                codec: probeData.streams?.[0]?.codec_name || 'm4a',
                cachedAt: Date.now(),
              };
              saveAudioLinkCache(linkCache);

              ensureAudiobookDirs();
              const ytLocalCopy = path.join(USER_YT_DOWNLOADS_DIR, path.basename(downloadedFilePath));
              try { fs.copyFileSync(downloadedFilePath, ytLocalCopy); } catch {}

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                filePath: downloadedFilePath,
                fileName: path.basename(downloadedFilePath),
                title: detectedTitle || path.basename(downloadedFilePath),
                duration: durationSecRaw,
                durationSec,
                formattedDuration,
                streamUrl,
                codec: probeData.streams?.[0]?.codec_name || 'm4a',
              }));
            } catch (err: any) {
              console.error('[Audiobook Download Error]', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Download failed' }));
            }
          });
          return;
        }

        // POST /api/audiobook/generate-anime-artwork
        if (url === '/api/audiobook/generate-anime-artwork' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { audioPath, audioFileName, headerTitle, authorName, customPrompt, apiKey, imageModel, artStyle } = JSON.parse(body || '{}');

              const ART_STYLE_MAP: Record<string, { labelMm: string; directive: string; promptSuffix: string }> = {
                'anime': {
                  labelMm: '🌸 Anime Style (ဂျပန် Anime / Light Novel)',
                  directive: 'The art style MUST strictly be high-end Japanese 2D anime & manga light novel art with vibrant studio anime lighting, beautiful clean linework, expressive character design.',
                  promptSuffix: 'vibrant 2D Japanese anime digital art style, beautiful light novel book cover aesthetic, highly detailed anime illustration, expressive anime character features, dynamic studio lighting, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
                '2d-sketch': {
                  labelMm: '✏️ 2D Sketch (ခဲတံ/မင်ရေး ပုံကြမ်း)',
                  directive: 'The art style MUST strictly be artistic 2D hand-drawn graphite pencil and ink sketch line art, expressive cross-hatching, classic monochrome or warm sepia illustration.',
                  promptSuffix: 'masterpiece 2D artistic pencil and ink sketch, hand-drawn graphite cross-hatching, expressive charcoal line work, elegant vintage book sketch art, warm sepia paper texture, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
                '3d-animation': {
                  labelMm: '🎬 3D Animation Style (Pixar / Disney 3D)',
                  directive: 'The art style MUST strictly be high-end stylized 3D animation, Pixar / Disney 3D CGI animation render, subsurface scattering, warm volumetric lighting, polished 3D character design.',
                  promptSuffix: 'high-end stylized 3D animation render, Pixar and Disney inspired 3D CGI character art, warm subsurface scattering, tactile textures, rich expressive lighting, octane render, 8k resolution, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
                'funny-art': {
                  labelMm: '😂 Funny Art Style (ဟာသ / Caricature)',
                  directive: 'The art style MUST strictly be comical humorous satirical caricature cartoon, exaggerated funny expressions, witty playful comic aesthetics for a comedy book.',
                  promptSuffix: 'humorous comical funny art style, witty satirical caricature illustration, exaggerated funny facial expressions, playful colorful comic book aesthetics, cheerful lively comic book cover art, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
                'horror': {
                  labelMm: '👻 Horror Style (သည်းထိတ်ရင်ဖို / Dark Gothic)',
                  directive: 'The art style MUST strictly be dark gothic horror, chilling shadows, eerie suspenseful lighting, supernatural macabre mood for a horror / thriller book.',
                  promptSuffix: 'dark gothic horror book cover art, eerie shadowy suspenseful atmosphere, haunting dramatic chiaroscuro lighting, creepy supernatural thriller mood, cinematic spine-chilling visual tone, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
                'realistic': {
                  labelMm: '📸 Realistic (အစစ်အမှန် ဓာတ်ပုံဆန်ဆန်)',
                  directive: 'The art style MUST strictly be cinematic photorealistic photography, lifelike human features and skin textures, authentic natural lighting, National Geographic / cinema still.',
                  promptSuffix: 'award-winning cinematic photorealistic photography, ultra-realistic portrait, lifelike human skin textures, authentic natural lighting, film cinema still, 8k photographic resolution, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
                'auto': {
                  labelMm: '📖 Auto Detect Style',
                  directive: 'Choose the most natural art style matching the true narrative and historical/literary genre of the story.',
                  promptSuffix: 'masterpiece dramatic book cover illustration matching the genre, atmospheric cinematic lighting, highly detailed digital painting, rich color palette, vertical 3:4 aspect ratio, clean, no text, no letters, no watermark',
                },
              };

              const selectedStyleConfig = ART_STYLE_MAP[artStyle || 'auto'] || ART_STYLE_MAP['auto'];
              console.log(`[Audiobook AI] 🎨 Selected Cover Art Style: "${selectedStyleConfig.labelMm}"`);

              let resolvedAudioPath = '';
              if (audioPath) {
                let cleanPath = (audioPath as string).trim();
                if (cleanPath.startsWith('/api/audiobook/audio-file?path=')) {
                  cleanPath = decodeURIComponent(cleanPath.split('path=')[1] || '');
                } else if (cleanPath.startsWith('/downloads/')) {
                  cleanPath = path.resolve(process.cwd(), 'public', cleanPath.replace(/^\//, ''));
                }
                if (fs.existsSync(cleanPath)) {
                  resolvedAudioPath = cleanPath;
                }
              }

              let detectedAudioTitle = '';
              try {
                const cacheFile = path.resolve(process.cwd(), 'data', 'audiobook_temp', 'audio_link_cache.json');
                if (fs.existsSync(cacheFile)) {
                  const linkCache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
                  for (const k of Object.keys(linkCache)) {
                    const entry = linkCache[k];
                    if (entry.filePath === resolvedAudioPath || (resolvedAudioPath && resolvedAudioPath.endsWith(entry.fileName))) {
                      detectedAudioTitle = entry.title || '';
                      break;
                    }
                  }
                }
              } catch {}

              if (!detectedAudioTitle && audioFileName) {
                detectedAudioTitle = (audioFileName as string).replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
              }

              const currentEffectiveTitle = detectedAudioTitle || headerTitle || 'Burmese Audiobook';
              console.log(`[Audiobook AI] 🎯 Active Audio Track Detected: "${currentEffectiveTitle}" (File: ${resolvedAudioPath || 'none'})`);

              const tempDir = path.resolve(process.cwd(), 'data', 'audiobook_temp');
              if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

              const downloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
              if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

              const ffmpegPath = getFfmpegPath();
              let storySummaryMm = '';
              let genre = '';
              let characterConcept = '';
              let suggestedTitle = '';
              let animePrompt = '';

              const effectiveApiKey = (apiKey || process.env.VITE_GEMINI_API_KEY || '').trim();

              if (resolvedAudioPath && effectiveApiKey) {
                const sampleMp3Path = path.join(tempDir, `sample_${Date.now()}.mp3`);
                try {
                  console.log(`[Audiobook AI] 🎵 Extracting 7-minute lightweight audio sample for deep analysis: ${resolvedAudioPath}...`);
                  execSync(`"${ffmpegPath}" -y -ss 0 -i "${resolvedAudioPath}" -t 420 -ac 1 -ar 16000 -b:a 16k "${sampleMp3Path}" 2>/dev/null`);

                  if (fs.existsSync(sampleMp3Path) && fs.statSync(sampleMp3Path).size > 0) {
                    const sampleBase64 = fs.readFileSync(sampleMp3Path).toString('base64');
                    console.log(`[Audiobook AI] 🎧 Sending 7-minute sample to Gemini for real audio understanding...`);

                    const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
                    for (const model of candidateModels) {
                      try {
                        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            contents: [{
                              parts: [
                                {
                                  inlineData: {
                                    mimeType: 'audio/mp3',
                                    data: sampleBase64
                                  }
                                },
                                {
                                  text: `You are an expert cultural & historical analyst and master book cover art director.
Listen thoroughly to this audio excerpt from a Burmese audiobook / speech / documentary / story.
Track Title: "${currentEffectiveTitle}"
Author: "${authorName || ''}"
Custom instructions: "${customPrompt || ''}"

CRITICAL INSTRUCTIONS:
1. REAL AUDIO COMPREHENSION: Listen to the Burmese speech and identify the exact subject and tone:
   - What is the story/speech discussing? Notice the actual narrative and theme.
   - If satirical / comedy: depict comical characters and vibrant satirical scenes, 3:4 book cover aspect ratio, clean, no text.
   - If political history / biography / military governance: depict appropriate historical figures with dignity and authenticity.
   - If Buddhism or Dhamma: depict a serene monk and monastery.
   - If romance or fiction: depict appropriate characters and emotional atmosphere matching the title.
2. ACCURATE PROTAGONIST & TONE matching "${currentEffectiveTitle}".
3. ART STYLE & RATIO: Vertical 3:4 aspect ratio book cover prompt.
   - MANDATORY ART STYLE: ${selectedStyleConfig.directive}
   - Strict rule: clean, no text, no letters, no watermark.
4. SUMMARY IN BURMESE: Write an accurate 1-2 sentence Burmese summary (storySummaryMm).

Respond ONLY with a JSON object:
{
  "genre": "Genre name in Burmese or English",
  "storySummaryMm": "မြန်မာလို ဇာတ်လမ်း သို့မဟုတ် အကြောင်းအရာ အကျဉ်း ၁-၂ ကြောင်း",
  "characterConcept": "Accurate character concept summary",
  "suggestedTitle": "Suggested Burmese or English Title",
  "animePrompt": "Masterpiece book cover illustration, ${selectedStyleConfig.promptSuffix}, ... (detailed English prompt matching the real subject)"
}`
                                }
                              ]
                            }],
                            generationConfig: {
                              temperature: 0.3,
                              responseMimeType: 'application/json'
                            }
                          })
                        });

                        if (geminiRes.ok) {
                          const geminiJson = await geminiRes.json();
                          const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
                          if (rawText) {
                            const parsed = JSON.parse(rawText);
                            storySummaryMm = parsed.storySummaryMm || '';
                            genre = parsed.genre || '';
                            characterConcept = parsed.characterConcept || '';
                            suggestedTitle = parsed.suggestedTitle || '';
                            animePrompt = parsed.animePrompt || '';
                            console.log(`[Audiobook AI] ✅ Successfully analyzed audio with ${model}! Summary: ${storySummaryMm}`);
                            break;
                          }
                        }
                      } catch (analysisErr: any) {
                        console.warn(`[Gemini Audio Analysis Error on ${model}]`, analysisErr.message);
                      }
                    }
                  }
                } catch (sampleErr: any) {
                  console.warn('[Sample extraction error]', sampleErr.message);
                } finally {
                  if (fs.existsSync(sampleMp3Path)) {
                    try { fs.unlinkSync(sampleMp3Path); } catch {}
                  }
                }
              }

              let finalAnimePrompt = animePrompt;
              if (!finalAnimePrompt && effectiveApiKey) {
                try {
                  const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${effectiveApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{
                        parts: [{
                          text: `You are an expert cultural & historical analyst and master book cover art director.
Design an accurate, evocative, high quality vertical 3:4 book cover illustration prompt for this Burmese story / audiobook:
Story / Audio Title: "${currentEffectiveTitle}"
Author: "${authorName || ''}"
Custom instructions: "${customPrompt || ''}"

CRITICAL INSTRUCTIONS:
1. ACCURATE SCENE & PROTAGONIST MATCHING for "${currentEffectiveTitle}".
2. MANDATORY ART STYLE: ${selectedStyleConfig.directive}
3. Clean, no text, no letters, no watermark.

Respond ONLY with a JSON object:
{
  "genre": "Genre name in Burmese or English",
  "storySummaryMm": "မြန်မာလို ဇာတ်လမ်း အကျဉ်း ၁-၂ ကြောင်း",
  "animePrompt": "Masterpiece book cover illustration, ${selectedStyleConfig.promptSuffix}, ... (detailed English prompt matching the story)"
}`
                        }]
                      }],
                      generationConfig: {
                        temperature: 0.4,
                        responseMimeType: 'application/json'
                      }
                    })
                  });

                  if (textRes.ok) {
                    const textJson = await textRes.json();
                    const raw = textJson.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (raw) {
                      const parsed = JSON.parse(raw);
                      storySummaryMm = parsed.storySummaryMm || storySummaryMm;
                      genre = parsed.genre || genre;
                      finalAnimePrompt = parsed.animePrompt || '';
                    }
                  }
                } catch (err: any) {
                  console.warn('[Gemini Text Fallback Error]', err.message);
                }
              }

              if (!finalAnimePrompt) {
                finalAnimePrompt = `Masterpiece dramatic book cover illustration for '${currentEffectiveTitle}', atmospheric cinematic lighting, highly detailed digital painting, rich color palette, 8k resolution, vertical 3:4 book cover aspect ratio, clean, no text, no watermark`;
                storySummaryMm = storySummaryMm || `"${currentEffectiveTitle}" အတွက် စာအုပ်မျက်နှာဖုံးပုံ`;
                genre = genre || 'အသံထွက်စာအုပ်';
              } else if (customPrompt && customPrompt.trim()) {
                finalAnimePrompt = `${customPrompt.trim()}, ${finalAnimePrompt}`;
              }

              const outFilename = `anime_cover_${Date.now()}.png`;
              const outFilePath = path.join(downloadsDir, outFilename);
              let imageBuffer: Buffer | null = null;

              const preferredModel = (imageModel || 'gemini-nano-banana-2.1').trim();
              const candidateModels = [
                preferredModel,
                'gemini-nano-banana-2.1',
                'imagen-3.0-generate-002',
                'imagen-3.0-fast-generate-001',
                'gemini-2.0-flash-exp',
                'gemini-2.5-flash-image',
              ].filter((v, i, a) => Boolean(v && a.indexOf(v) === i));

              if (effectiveApiKey) {
                for (const m of candidateModels) {
                  try {
                    if (m.startsWith('imagen-') || m.includes('imagen')) {
                      const imgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:predict?key=${effectiveApiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          instances: [{ prompt: finalAnimePrompt }],
                          parameters: {
                            sampleCount: 1,
                            aspectRatio: '3:4',
                            outputMimeType: 'image/jpeg'
                          }
                        })
                      });

                      if (imgRes.ok) {
                        const imgJson = await imgRes.json();
                        const base64Data = imgJson.predictions?.[0]?.bytesBase64Encoded || imgJson.generatedImages?.[0]?.image?.imageBytes;
                        if (base64Data) {
                          imageBuffer = Buffer.from(base64Data, 'base64');
                          break;
                        }
                      }
                    } else {
                      const geminiImgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${effectiveApiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          contents: [{
                            parts: [{
                              text: `Task: Create a vertical 3:4 book cover illustration.\nScene: ${finalAnimePrompt}\nArt Style: ${selectedStyleConfig.promptSuffix}\nStrict Rule: Clean illustration, absolutely no text, no letters, no watermark.`
                            }]
                          }],
                          generationConfig: {
                            responseModalities: ["IMAGE"],
                            imageConfig: {
                              aspectRatio: "3:4"
                            }
                          }
                        })
                      });

                      if (geminiImgRes.ok) {
                        const geminiJson = await geminiImgRes.json();
                        const parts = geminiJson.candidates?.[0]?.content?.parts;
                        if (parts) {
                          for (const p of parts) {
                            if (p.inlineData?.data) {
                              imageBuffer = Buffer.from(p.inlineData.data, 'base64');
                              break;
                            }
                          }
                        }
                        if (imageBuffer) break;
                      }
                    }
                  } catch (e: any) {
                    console.warn(`[Audiobook Anime Model ${m} Error]`, e.message);
                  }
                }
              }

              if (!imageBuffer) {
                const cfAccountId = 'ea575a814075a426f26927a3e761d800';
                const cfApiToken = 'cfut_ApUJ9vyacha7ZJEQEzt0AoyKBW7GHiYIsvFMeu8E8544a95e';
                try {
                  const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${cfApiToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: `vertical 3:4 portrait book cover, ${finalAnimePrompt}` })
                  });
                  if (cfRes.ok) {
                    const cfJson = await cfRes.json();
                    if (cfJson.result?.image) {
                      imageBuffer = Buffer.from(cfJson.result.image, 'base64');
                    }
                  }
                } catch (cfErr) {
                  console.warn('[Cloudflare FLUX error]', cfErr);
                }
              }

              if (!imageBuffer) {
                const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalAnimePrompt)}?width=768&height=1024&nologo=true&model=flux`;
                const pollRes = await fetch(pollUrl);
                if (pollRes.ok) {
                  const arrayBuf = await pollRes.arrayBuffer();
                  imageBuffer = Buffer.from(arrayBuf);
                }
              }

              if (!imageBuffer) {
                throw new Error('All image generation models failed to produce an image.');
              }

              const rawTempPath = path.join(tempDir, `raw_cover_${Date.now()}.png`);
              fs.writeFileSync(rawTempPath, imageBuffer);

              try {
                execSync(`"${ffmpegPath}" -y -i "${rawTempPath}" -vf "scale=768:1024:force_original_aspect_ratio=increase,crop=768:1024" "${outFilePath}" 2>/dev/null`);
              } catch {
                fs.copyFileSync(rawTempPath, outFilePath);
              } finally {
                if (fs.existsSync(rawTempPath)) {
                  try { fs.unlinkSync(rawTempPath); } catch {}
                }
              }

              const archiveFilePath = path.join(tempDir, outFilename);
              try { fs.copyFileSync(outFilePath, archiveFilePath); } catch {}

              ensureAudiobookDirs();
              const userAiPath = path.join(USER_AI_GEN_DIR, outFilename);
              try { fs.copyFileSync(outFilePath, userAiPath); } catch {}

              const imageUrl = `/downloads/${outFilename}`;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                imageUrl,
                imagePath: outFilePath,
                animePrompt: finalAnimePrompt,
                storySummaryMm: storySummaryMm || 'ဇာတ်လမ်းအသံဖိုင်မှ AI ဖြင့် ဆန်းစစ်ထားသော Anime ကာဗာပုံ',
                genre: genre || 'Anime Story',
                characterConcept: characterConcept || '',
                suggestedTitle: suggestedTitle || ''
              }));
            } catch (err: any) {
              console.error('[Generate Anime Artwork Error]', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Artwork generation failed' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
