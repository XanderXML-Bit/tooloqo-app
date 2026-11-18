import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CanonicalSync } from '@/components/common/CanonicalSync';
import { canonicalUrlFor } from '@/lib/site';
import { routeMetaFor, ROUTE_META_PATHS } from '@/lib/routeMeta';
import { SITEMAP_PATHS } from '@/lib/crawl';

const expectedOrigin = new URL(import.meta.env.VITE_SITE_URL || 'https://tooloqo.zendren.net').origin;

describe('CanonicalSync', () => {
  beforeEach(() => {
    document.head.innerHTML =
      `<link rel="canonical" href="${expectedOrigin}/" />` +
      `<meta property="og:url" content="${expectedOrigin}/" />`;
  });

  it('builds absolute production canonical URLs', () => {
    expect(canonicalUrlFor('/pdf/merge')).toBe(`${expectedOrigin}/pdf/merge`);
    expect(canonicalUrlFor('image')).toBe(`${expectedOrigin}/image`);
  });

  it('updates canonical and og:url to the current route without the query string', () => {
    render(
      <MemoryRouter initialEntries={['/image/resize?utm_source=x#top']}>
        <CanonicalSync />
      </MemoryRouter>
    );
    const link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(link.href).toBe(`${expectedOrigin}/image/resize`);
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${expectedOrigin}/image/resize`
    );
  });

  it('creates the canonical link if index.html did not ship one', () => {
    document.head.innerHTML = '';
    render(
      <MemoryRouter initialEntries={['/text']}>
        <CanonicalSync />
      </MemoryRouter>
    );
    expect((document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement).href).toBe(
      `${expectedOrigin}/text`
    );
  });
});

describe('CanonicalSync route titles (audit item 7)', () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<meta name="description" content="generic" />' +
      '<meta property="og:title" content="generic" />' +
      '<meta property="og:description" content="generic" />' +
      '<meta name="twitter:title" content="generic" />' +
      '<meta name="twitter:description" content="generic" />';
  });

  it('sets the title and every description tag for the route', () => {
    render(
      <MemoryRouter initialEntries={['/pdf/pdf-to-image']}>
        <CanonicalSync />
      </MemoryRouter>
    );
    const meta = routeMetaFor('/pdf/pdf-to-image');
    expect(document.title).toBe(meta.title);
    for (const sel of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      expect(document.head.querySelector(sel)?.getAttribute('content')).toBe(meta.description);
    }
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(meta.title);
  });

  it('gives every public route its own title and description', () => {
    const paths = [...SITEMAP_PATHS, '/settings'];
    const titles = new Set(paths.map((p) => routeMetaFor(p).title));
    const descriptions = new Set(paths.map((p) => routeMetaFor(p).description));
    expect(titles.size).toBe(paths.length);
    expect(descriptions.size).toBe(paths.length);
    for (const p of paths) expect(ROUTE_META_PATHS).toContain(p);
  });

  it('labels unknown routes as not found', () => {
    expect(routeMetaFor('/nope').title).toMatch(/not found/i);
    expect(routeMetaFor('/image/resize/').title).toBe(routeMetaFor('/image/resize').title);
  });
});
