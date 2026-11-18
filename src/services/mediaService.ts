import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type {
  AudioConvertOptions,
  VideoCompressOptions,
  VideoToGifOptions,
  ExtractAudioOptions,
  MediaProcessResult,
  VideoCompressPreset,
} from '@/types';
import { validateBeforeProcess } from '@/utils/validation';

export class MediaProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaProcessingError';
  }
}

// Singleton FFmpeg instance
let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

// FFmpeg CDN URLs
const FFMPEG_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

// Video compression preset configurations (CRF: lower = better quality, higher file size)
const VIDEO_COMPRESS_PRESETS: Record<VideoCompressPreset, string[]> = {
  web: ['-c:v', 'libx264', '-crf', '28', '-preset', 'fast', '-c:a', 'aac', '-b:a', '128k'],
  mobile: ['-c:v', 'libx264', '-crf', '32', '-preset', 'fast', '-vf', 'scale=720:-2', '-c:a', 'aac', '-b:a', '96k'],
  archive: ['-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-c:a', 'aac', '-b:a', '192k'],
};

/** Generate unique filename to prevent concurrent operation conflicts */
let operationCounter = 0;
function uniqueName(prefix: string, ext: string): string {
  return `${prefix}_${++operationCounter}_${Date.now()}.${ext}`;
}

/**
 * Run FFmpeg command (wrapper to avoid naming conflicts)
 */
async function runFFmpegCommand(ff: FFmpeg, args: string[]): Promise<void> {
  // FFmpeg.wasm exec method - not Node's child_process
  await ff['exec'](args);
}

/**
 * Load FFmpeg.wasm (lazy, cached)
 * Downloads about 32 MB on first call, then reuses the loaded engine.
 */
export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) {
    return ffmpeg;
  }

  if (loadPromise) {
    await loadPromise;
    return ffmpeg!;
  }

  const engine = new FFmpeg();
  ffmpeg = engine;

  // FFmpeg emits processing progress, not download progress.
  engine.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });

  loadPromise = (async () => {
    const blobURLs: string[] = [];
    try {
      const coreURL = await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.js`, 'text/javascript');
      blobURLs.push(coreURL);
      const wasmURL = await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');
      blobURLs.push(wasmURL);
      await engine.load({ coreURL, wasmURL });
    } catch (error) {
      engine.terminate();
      ffmpeg = null;
      loadPromise = null;
      const cause = error instanceof Error ? error.message : String(error);
      throw new MediaProcessingError(
        `Failed to load FFmpeg: ${cause}. Check your connection and select Try again.`
      );
    } finally {
      blobURLs.forEach((url) => URL.revokeObjectURL(url));
    }
  })();

  await loadPromise;
  return ffmpeg;
}

/**
 * Check if FFmpeg is loaded
 */
export function isFFmpegLoaded(): boolean {
  return ffmpeg?.loaded ?? false;
}

/**
 * Get MIME type for audio format
 */
function getAudioMimeType(format: string): string {
  const types: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
  };
  return types[format] || 'application/octet-stream';
}

/**
 * Convert audio to different format
 */
async function convertAudio(
  input: Blob,
  options: AudioConvertOptions,
  onProgress?: (progress: number) => void
): Promise<MediaProcessResult> {
  // Validate input
  const validation = validateBeforeProcess(input, 'audio');
  if (!validation.valid) {
    throw new MediaProcessingError(validation.error!);
  }

  const ff = await loadFFmpeg(onProgress);
  const startTime = Date.now();

  const inputName = uniqueName('input', 'audio');
  const outputName = uniqueName('output', options.format);

  try {
    // Write input file to FFmpeg virtual filesystem
    await ff.writeFile(inputName, await fetchFile(input));

    // Build FFmpeg command
    const args = ['-i', inputName];

    if (options.bitrate) {
      args.push('-b:a', `${options.bitrate}k`);
    }

    if (options.sampleRate) {
      args.push('-ar', String(options.sampleRate));
    }

    // Output file
    args.push('-y', outputName);

    // Run conversion
    await runFFmpegCommand(ff, args);

    // Read output
    const data = await ff.readFile(outputName);
    // Copy to new ArrayBuffer to fix TypeScript SharedArrayBuffer compatibility
    const bytes = data as Uint8Array;
    const buffer = new ArrayBuffer(bytes.length);
    new Uint8Array(buffer).set(bytes);
    const blob = new Blob([buffer], { type: getAudioMimeType(options.format) });

    // Cleanup
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    return {
      blob,
      originalSize: input.size,
      processedSize: blob.size,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    // Attempt cleanup on error
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
    } catch {
      // Ignore cleanup errors
    }
    throw new MediaProcessingError(
      `Audio conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Compress video with preset
 */
async function compressVideo(
  input: Blob,
  options: VideoCompressOptions,
  onProgress?: (progress: number) => void
): Promise<MediaProcessResult> {
  // Validate input
  const validation = validateBeforeProcess(input, 'video');
  if (!validation.valid) {
    throw new MediaProcessingError(validation.error!);
  }

  const ff = await loadFFmpeg(onProgress);
  const startTime = Date.now();

  const inputName = uniqueName('input', 'mp4');
  const outputName = uniqueName('output', 'mp4');

  try {
    await ff.writeFile(inputName, await fetchFile(input));

    const args = ['-i', inputName, ...VIDEO_COMPRESS_PRESETS[options.preset], '-y', outputName];

    await runFFmpegCommand(ff, args);

    const data = await ff.readFile(outputName);
    // Copy to new ArrayBuffer to fix TypeScript SharedArrayBuffer compatibility
    const bytes = data as Uint8Array;
    const buffer = new ArrayBuffer(bytes.length);
    new Uint8Array(buffer).set(bytes);
    const blob = new Blob([buffer], { type: 'video/mp4' });

    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    return {
      blob,
      originalSize: input.size,
      processedSize: blob.size,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
    } catch {
      // Ignore cleanup errors
    }
    throw new MediaProcessingError(
      `Video compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Convert video clip to GIF
 */
async function videoToGif(
  input: Blob,
  options: VideoToGifOptions,
  onProgress?: (progress: number) => void
): Promise<MediaProcessResult> {
  const validation = validateBeforeProcess(input, 'video');
  if (!validation.valid) {
    throw new MediaProcessingError(validation.error!);
  }

  if (options.endTime <= options.startTime) {
    throw new MediaProcessingError('End time must be greater than start time');
  }

  const ff = await loadFFmpeg(onProgress);
  const startTime = Date.now();

  const inputName = uniqueName('input', 'mp4');
  const paletteName = uniqueName('palette', 'png');
  const outputName = uniqueName('output', 'gif');

  try {
    await ff.writeFile(inputName, await fetchFile(input));

    const duration = options.endTime - options.startTime;
    const width = options.width || 480;

    // Two-pass encoding for better GIF quality
    // Pass 1: Generate color palette
    await runFFmpegCommand(ff, [
      '-ss', String(options.startTime),
      '-t', String(duration),
      '-i', inputName,
      '-vf', `fps=${options.fps},scale=${width}:-1:flags=lanczos,palettegen`,
      '-y', paletteName
    ]);

    // Pass 2: Generate GIF using palette
    await runFFmpegCommand(ff, [
      '-ss', String(options.startTime),
      '-t', String(duration),
      '-i', inputName,
      '-i', paletteName,
      '-lavfi', `fps=${options.fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
      '-y', outputName
    ]);

    const data = await ff.readFile(outputName);
    // Copy to new ArrayBuffer to fix TypeScript SharedArrayBuffer compatibility
    const bytes = data as Uint8Array;
    const buffer = new ArrayBuffer(bytes.length);
    new Uint8Array(buffer).set(bytes);
    const blob = new Blob([buffer], { type: 'image/gif' });

    await ff.deleteFile(inputName);
    await ff.deleteFile(paletteName);
    await ff.deleteFile(outputName);

    return {
      blob,
      originalSize: input.size,
      processedSize: blob.size,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(paletteName);
      await ff.deleteFile(outputName);
    } catch {
      // Ignore cleanup errors
    }
    throw new MediaProcessingError(
      `GIF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract audio from video
 */
async function extractAudio(
  input: Blob,
  options: ExtractAudioOptions,
  onProgress?: (progress: number) => void
): Promise<MediaProcessResult> {
  const validation = validateBeforeProcess(input, 'video');
  if (!validation.valid) {
    throw new MediaProcessingError(validation.error!);
  }

  const ff = await loadFFmpeg(onProgress);
  const startTime = Date.now();

  const inputName = uniqueName('input', 'mp4');
  const outputName = uniqueName('output', options.format);

  try {
    await ff.writeFile(inputName, await fetchFile(input));

    const args = ['-i', inputName, '-vn']; // -vn removes video stream

    if (options.bitrate) {
      args.push('-b:a', `${options.bitrate}k`);
    }

    args.push('-y', outputName);

    await runFFmpegCommand(ff, args);

    const data = await ff.readFile(outputName);
    // Copy to new ArrayBuffer to fix TypeScript SharedArrayBuffer compatibility
    const bytes = data as Uint8Array;
    const buffer = new ArrayBuffer(bytes.length);
    new Uint8Array(buffer).set(bytes);
    const blob = new Blob([buffer], { type: getAudioMimeType(options.format) });

    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    return {
      blob,
      originalSize: input.size,
      processedSize: blob.size,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
    } catch {
      // Ignore cleanup errors
    }
    throw new MediaProcessingError(
      `Audio extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get video duration in seconds
 */
async function getVideoDuration(input: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new MediaProcessingError('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(input);
  });
}

// Export service object
export const mediaService = {
  loadFFmpeg,
  isFFmpegLoaded,
  convertAudio,
  compressVideo,
  videoToGif,
  extractAudio,
  getVideoDuration,
};
