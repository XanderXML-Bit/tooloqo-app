/// <reference types="vite/client" />

/** Production origin for canonical/share URLs (never a preview deployment). */
// tooloqo.vercel.app stays a served alias (no redirect); metadata names the branded host unless VITE_SITE_URL overrides it.
export function resolveSiteOrigin(value?: string): string {
  const url = new URL(value?.trim() || 'https://tooloqo.zendren.net');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an HTTP(S) origin without credentials, a path, query, or fragment');
  }
  return url.origin;
}

export const SITE_ORIGIN = resolveSiteOrigin(import.meta.env?.VITE_SITE_URL);

/** Absolute canonical URL for a route path; query strings and hashes are dropped. */
export function canonicalUrlFor(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${path}`;
}
