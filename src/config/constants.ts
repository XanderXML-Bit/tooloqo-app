/**
 * App-wide constants and configuration
 * @module config/constants
 */

// App info
export const APP_NAME = 'Tooloqo';
export const APP_VERSION = '0.1.0';
export const APP_ID = 'com.tooloqo.app';
export const APP_DESCRIPTION = 'Unified utility toolkit for image, PDF, media, and file conversion';

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'tooloqo_settings',
  THEME: 'tooloqo_theme',
  AUTO_CLEANUP: 'tooloqo_auto_cleanup',
  RECENT_FILES: 'tooloqo_recent_files',
  PURCHASES: 'tooloqo_purchases',
  ONBOARDING_COMPLETE: 'tooloqo_onboarding',
  FILE_STORE: 'tooloqo-files',
  SETTINGS_STORE: 'tooloqo-settings',
  PURCHASE_STORE: 'tooloqo-purchases',
} as const;

// File size limits (in bytes)
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  PDF_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  AUDIO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Supported file types
export const SUPPORTED_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  PDF: ['application/pdf'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
} as const;

// Image presets
export const IMAGE_PRESETS = {
  INSTAGRAM_SQUARE: { width: 1080, height: 1080, label: 'Instagram Square' },
  INSTAGRAM_PORTRAIT: { width: 1080, height: 1350, label: 'Instagram Portrait' },
  INSTAGRAM_LANDSCAPE: { width: 1080, height: 566, label: 'Instagram Landscape' },
  INSTAGRAM_STORY: { width: 1080, height: 1920, label: 'Instagram Story' },
  FACEBOOK_POST: { width: 1200, height: 630, label: 'Facebook Post' },
  FACEBOOK_COVER: { width: 820, height: 312, label: 'Facebook Cover' },
  TWITTER_POST: { width: 1200, height: 675, label: 'Twitter Post' },
  TWITTER_HEADER: { width: 1500, height: 500, label: 'Twitter Header' },
  LINKEDIN_POST: { width: 1200, height: 627, label: 'LinkedIn Post' },
  LINKEDIN_BANNER: { width: 1584, height: 396, label: 'LinkedIn Banner' },
  YOUTUBE_THUMBNAIL: { width: 1280, height: 720, label: 'YouTube Thumbnail' },
  YOUTUBE_BANNER: { width: 2560, height: 1440, label: 'YouTube Banner' },
} as const;

// Aspect ratio presets
export const ASPECT_RATIOS = [
  { value: undefined, label: 'Free' },
  { value: 1, label: '1:1' },
  { value: 4 / 3, label: '4:3' },
  { value: 16 / 9, label: '16:9' },
  { value: 3 / 2, label: '3:2' },
  { value: 9 / 16, label: '9:16' },
] as const;

// Quality presets for compression
export const QUALITY_PRESETS = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
  MAXIMUM: 0.95,
} as const;

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Cache TTL (ms)
export const CACHE_TTL = {
  SETTINGS: 5000, // 5 seconds
  THUMBNAILS: 60000, // 1 minute
} as const;

// Reading/speaking speeds (words per minute)
export const READING_SPEED = {
  AVERAGE_READING: 200,
  AVERAGE_SPEAKING: 130,
} as const;
