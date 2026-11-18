import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SITEMAP_PATHS, buildRobotsTxt, buildSitemapXml } from '@/lib/crawl';

const root = resolve(__dirname, '../..');
const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
const routePaths = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]);
const origin = 'https://tooloqo.zendren.net';

describe('robots.txt and sitemap.xml', () => {
  it('lists every public web route and no private or native-only route', () => {
    const expected = routePaths.filter((p) => !['*', '/ad-free', '/settings'].includes(p));
    expect([...SITEMAP_PATHS].sort()).toEqual([...expected].sort());
    expect(new Set(SITEMAP_PATHS).size).toBe(SITEMAP_PATHS.length);
  });

  it('allows all crawlers and names the sitemap on the same origin', () => {
    const lines = buildRobotsTxt(origin).split('\n');
    expect(lines).toContain('User-agent: *');
    expect(lines).toContain('Allow: /');
    expect(lines).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  it('writes one absolute loc per route, all on the given origin', () => {
    const xml = buildSitemapXml(origin);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(SITEMAP_PATHS.map((p) => `${origin}${p}`));
  });
});
