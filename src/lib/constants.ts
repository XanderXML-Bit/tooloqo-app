import type { ToolCategory } from '@/types';

export const TOOL_CATEGORIES: { id: ToolCategory; name: string; icon: string }[] = [
  { id: 'image', name: 'Image Tools', icon: 'Image' },
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText' },
  { id: 'media', name: 'Media Tools', icon: 'Film' },
  { id: 'text', name: 'Text Tools', icon: 'Type' },
];

export const IMAGE_RESIZE_PRESETS = [
  { id: 'instagram-square', name: 'Instagram Square', width: 1080, height: 1080 },
  { id: 'instagram-portrait', name: 'Instagram Portrait', width: 1080, height: 1350 },
  { id: 'instagram-landscape', name: 'Instagram Landscape', width: 1080, height: 608 },
  { id: 'facebook-post', name: 'Facebook Post', width: 1200, height: 630 },
  { id: 'twitter-post', name: 'Twitter Post', width: 1200, height: 675 },
  { id: 'linkedin-post', name: 'LinkedIn Post', width: 1200, height: 627 },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { id: 'hd', name: 'HD (1280x720)', width: 1280, height: 720 },
  { id: 'fullhd', name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
  { id: '4k', name: '4K (3840x2160)', width: 3840, height: 2160 },
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  showThumbnails: true,
  analyticsEnabled: false,
};
