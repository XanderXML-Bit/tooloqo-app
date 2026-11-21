import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Vercel serves public/404.html with HTTP 404 for any path that no rewrite matches,
// so every client-side route must have an explicit rewrite to index.html.
const root = resolve(__dirname, '../..');
const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
  rewrites: { source: string; destination: string }[];
  installCommand: string;
};
const routePaths = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]);
const sources = vercel.rewrites.map((r) => r.source);

describe('vercel.json routing', () => {
  it('rewrites every web route in App.tsx to index.html', () => {
    const webRoutes = routePaths.filter((p) => p !== '*' && p !== '/' && p !== '/ad-free');
    expect(webRoutes.length).toBeGreaterThan(20);
    for (const p of webRoutes) expect(sources).toContain(p);
    for (const r of vercel.rewrites) expect(r.destination).toBe('/index.html');
  });

  it('has no catch-all rewrite, so unknown paths return a real 404', () => {
    for (const s of sources) {
      expect(s).not.toMatch(/[(*:]/);
      expect(routePaths).toContain(s);
    }
    expect(sources).not.toContain('/ad-free');
  });

  it('ships a styled static 404 page with the Zendren copyright and links', () => {
    const page = resolve(root, 'public/404.html');
    expect(existsSync(page)).toBe(true);
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('Page not found');
    const footer = html.match(/<footer>([\s\S]*?)<\/footer>/)?.[1] ?? '';
    expect(footer).toMatch(/<p>© <span id="y">\d{4}<\/span> Zendren<\/p>/);
    expect(Array.from(footer.matchAll(/href="([^"]+)"/g), ([, href]) => href)).toEqual([
      'https://zendren.net',
      '/privacy',
    ]);
  });

  it('installs from the lockfile', () => {
    expect(vercel.installCommand).toBe('npm ci');
  });
});
