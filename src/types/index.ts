export interface TooloqoFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  blob: Blob;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type ToolCategory = 'image' | 'pdf' | 'media' | 'text';

export type ImageTool =
  | 'resize'
  | 'compress'
  | 'crop'
  | 'convert'
  | 'rotate'
  | 'background-remove'
  | 'upscale'
  | 'watermark';

export type PdfTool =
  | 'merge'
  | 'split'
  | 'compress'
  | 'image-to-pdf'
  | 'pdf-to-image'
  | 'edit'
  | 'ocr'
  | 'password'
  | 'sign';

export type MediaTool =
  | 'video-compress'
  | 'video-to-gif'
  | 'audio-extract'
  | 'audio-convert';

export type TextTool = 'word-count' | 'case-convert' | 'text-compare';

export type ToolType = ImageTool | PdfTool | MediaTool | TextTool;

export type ProcessingStatus = 'queued' | 'processing' | 'complete' | 'error';

export interface ProcessingJob {
  id: string;
  tool: ToolType;
  inputFiles: TooloqoFile[];
  options: Record<string, unknown>;
  status: ProcessingStatus;
  progress: number;
  outputFiles?: TooloqoFile[];
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  acceptedMimeTypes: string[];
  maxFiles?: number;
  requiresNetwork?: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  showThumbnails: boolean;
  analyticsEnabled: boolean;
}

export interface AdState {
  adFree: boolean;
}

export interface ImageResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  preset?: 'instagram-square' | 'instagram-portrait' | 'facebook' | 'twitter' | 'custom';
}

export interface ImageCompressOptions {
  quality: number; // 0-100
  maxSizeKB?: number;
}

export interface ImageConvertOptions {
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
}

export interface ImageRotateOptions {
  degrees: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export interface PdfMergeOptions {
  order?: number[];
}

export interface PdfSplitOptions {
  pages: number[];
  mode: 'extract' | 'split-all';
}

export interface PdfCompressOptions {
  quality: 'screen' | 'ebook' | 'printer' | 'prepress';
}

// ===== Media Tool Types =====

/**
 * Supported audio formats for conversion
 */
export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a';

/**
 * Options for audio conversion
 */
export interface AudioConvertOptions {
  format: AudioFormat;
  bitrate?: number; // kbps (e.g., 128, 192, 256, 320)
  sampleRate?: number; // Hz (e.g., 44100, 48000)
}

/**
 * Video compression presets
 */
export type VideoCompressPreset = 'web' | 'mobile' | 'archive';

/**
 * Options for video compression
 */
export interface VideoCompressOptions {
  preset: VideoCompressPreset;
  targetSizeMB?: number; // Optional target file size
  maxWidth?: number; // Max output width
  maxHeight?: number; // Max output height
}

/**
 * GIF quality levels
 */
export type GifQuality = 'low' | 'medium' | 'high';

/**
 * Options for video to GIF conversion
 */
export interface VideoToGifOptions {
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  fps: 10 | 15 | 20 | 30;
  width?: number; // Output width (height auto-calculated)
  quality?: GifQuality;
}

/**
 * Options for extracting audio from video
 */
export interface ExtractAudioOptions {
  format: 'mp3' | 'wav' | 'aac';
  bitrate?: number;
}

/**
 * FFmpeg loading state
 */
export interface FFmpegState {
  loaded: boolean;
  loading: boolean;
  progress: number; // 0-100 during load
  error: string | null;
}

/**
 * Result of media processing operations
 */
export interface MediaProcessResult {
  blob: Blob;
  originalSize: number;
  processedSize: number;
  duration?: number; // Processing time in ms
}
