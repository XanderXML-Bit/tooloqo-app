import { Capacitor } from '@capacitor/core';

/** Per-route document title and meta description. CanonicalSync applies them on navigation. */
export interface RouteMeta {
  title: string;
  description: string;
}

const SUFFIX = ' | Tooloqo';

const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Tooloqo: image, PDF, media and text tools in your browser',
    description:
      'Free image, PDF, media and text tools that run in your browser. Files never leave your device.',
  },
  '/image': {
    title: 'Image tools' + SUFFIX,
    description: 'Resize, compress, crop, convert and rotate images in your browser. Files never leave your device.',
  },
  '/image/resize': {
    title: 'Resize an image' + SUFFIX,
    description: 'Resize JPG, PNG, WebP and GIF images to exact pixel sizes or social media presets, on your device.',
  },
  '/image/compress': {
    title: 'Compress an image' + SUFFIX,
    description: 'Reduce the file size of JPG, PNG and WebP images with a quality slider, on your device.',
  },
  '/image/crop': {
    title: 'Crop an image' + SUFFIX,
    description: 'Crop an image freely or to 1:1, 4:3, 16:9 and other aspect ratios, on your device.',
  },
  '/image/convert': {
    title: 'Convert an image to PNG, JPG or WebP' + SUFFIX,
    description: 'Convert images between PNG, JPG and WebP formats in your browser, without uploading them.',
  },
  '/image/rotate': {
    title: 'Rotate or flip an image' + SUFFIX,
    description: 'Rotate images by 90 degree steps or flip them horizontally and vertically, on your device.',
  },
  '/pdf': {
    title: 'PDF tools' + SUFFIX,
    description: 'Merge, split and compress PDFs, and convert between PDFs and images, in your browser.',
  },
  '/pdf/merge': {
    title: 'Merge PDFs' + SUFFIX,
    description: 'Combine several PDF files into one document in the order you choose, on your device.',
  },
  '/pdf/split': {
    title: 'Split a PDF' + SUFFIX,
    description: 'Extract selected pages from a PDF or split it into one file per page, on your device.',
  },
  '/pdf/compress': {
    title: 'Compress a PDF' + SUFFIX,
    description: 'Make a PDF smaller by removing metadata and optimizing its structure, on your device.',
  },
  '/pdf/image-to-pdf': {
    title: 'Convert images to a PDF' + SUFFIX,
    description: 'Turn JPG, PNG, WebP and GIF images into a single PDF document in your browser.',
  },
  '/pdf/pdf-to-image': {
    title: 'Convert a PDF to images' + SUFFIX,
    description: 'Save each page of a PDF as a PNG or JPG image in your browser, without uploading it.',
  },
  '/media': {
    title: 'Media tools' + SUFFIX,
    description: 'Compress video, make GIFs, extract audio and convert audio formats in your browser.',
  },
  '/media/audio-convert': {
    title: 'Convert audio files' + SUFFIX,
    description: 'Convert audio between MP3, WAV, AAC, FLAC, OGG and M4A in your browser, on your device.',
  },
  '/media/video-compress': {
    title: 'Compress a video' + SUFFIX,
    description: 'Reduce the file size of MP4, WebM and MOV videos with web, mobile and archive presets.',
  },
  '/media/video-to-gif': {
    title: 'Convert a video to a GIF' + SUFFIX,
    description: 'Make an animated GIF from part of a video, with frame rate and width controls.',
  },
  '/media/extract-audio': {
    title: 'Extract audio from a video' + SUFFIX,
    description: 'Save the soundtrack of a video as MP3, WAV or AAC in your browser, on your device.',
  },
  '/text': {
    title: 'Text tools' + SUFFIX,
    description: 'Count words, change letter case and compare two texts in your browser.',
  },
  '/text/word-count': {
    title: 'Word counter' + SUFFIX,
    description: 'Count words, characters, sentences and paragraphs, with reading and speaking time.',
  },
  '/text/case-convert': {
    title: 'Case converter' + SUFFIX,
    description: 'Change text to UPPERCASE, lowercase, Title Case, Sentence case or tOGGLE cASE.',
  },
  '/text/text-compare': {
    title: 'Compare two texts' + SUFFIX,
    description: 'See the lines added, removed and unchanged between two versions of a text.',
  },
  '/settings': {
    title: 'Settings' + SUFFIX,
    description: 'Choose the Tooloqo color theme.',
  },
  '/privacy': {
    title: 'Privacy' + SUFFIX,
    description: 'How Tooloqo handles your files and which other services the site contacts.',
  },
  '/ad-free': {
    title: 'Ad-free' + SUFFIX,
    description: 'Remove ads from the Tooloqo app.',
  },
};

const NOT_FOUND: RouteMeta = {
  title: 'Page not found' + SUFFIX,
  description: 'This page does not exist. Go to the Tooloqo home page to find a tool.',
};

/** Routes that App.tsx renders only in the native apps. The web build shows its 404 page there. */
const NATIVE_ONLY_PATHS = new Set(['/ad-free']);

/** Returns the metadata for a path. Unknown paths, and native-only paths on the web, get the 404 metadata. */
export function routeMetaFor(pathname: string, isNative: boolean = Capacitor.isNativePlatform()): RouteMeta {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (NATIVE_ONLY_PATHS.has(path) && !isNative) return NOT_FOUND;
  return ROUTE_META[path] ?? NOT_FOUND;
}

export const ROUTE_META_PATHS = Object.keys(ROUTE_META);
