/** Public routes listed in sitemap.xml. /settings and the native-only /ad-free page are left out. */
export const SITEMAP_PATHS = [
  '/',
  '/image',
  '/image/resize',
  '/image/compress',
  '/image/crop',
  '/image/convert',
  '/image/rotate',
  '/pdf',
  '/pdf/merge',
  '/pdf/split',
  '/pdf/compress',
  '/pdf/image-to-pdf',
  '/pdf/pdf-to-image',
  '/media',
  '/media/audio-convert',
  '/media/video-compress',
  '/media/video-to-gif',
  '/media/extract-audio',
  '/text',
  '/text/word-count',
  '/text/case-convert',
  '/text/text-compare',
  '/privacy',
] as const;

/** robots.txt body that allows every crawler and points to the sitemap on the same origin. */
export function buildRobotsTxt(origin: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

/** sitemap.xml body with one absolute URL per public route. */
export function buildSitemapXml(origin: string, paths: readonly string[] = SITEMAP_PATHS): string {
  const urls = paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
