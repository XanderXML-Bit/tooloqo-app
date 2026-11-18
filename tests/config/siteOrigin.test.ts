import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveSiteOrigin } from '../../src/lib/site';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('configured site origin', () => {
  it('defaults to the live production host', () => {
    expect(resolveSiteOrigin()).toBe('https://tooloqo.zendren.net');
    expect(resolveSiteOrigin('')).toBe('https://tooloqo.zendren.net');
    expect(resolveSiteOrigin('   ')).toBe('https://tooloqo.zendren.net');
  });

  it('normalizes whitespace and a trailing slash', () => {
    expect(resolveSiteOrigin(' https://tooloqo.vercel.app/ ')).toBe('https://tooloqo.vercel.app');
  });

  it.each([
    'not a URL', 'ftp://example.com', 'https://user:pass@example.com',
    'https://example.com/path', 'https://example.com/?query=1', 'https://example.com/#fragment',
  ])('rejects invalid origins: %s', (value) => {
    expect(() => resolveSiteOrigin(value)).toThrow();
  });

  it('honors a build-time origin override', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://tooloqo.vercel.app/');
    vi.resetModules();
    const module = await import('../../src/lib/site');
    expect(module.SITE_ORIGIN).toBe('https://tooloqo.vercel.app');
    expect(module.canonicalUrlFor('/image')).toBe('https://tooloqo.vercel.app/image');
  });
});
