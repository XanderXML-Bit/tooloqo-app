import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalUrlFor } from '@/lib/site';
import { routeMetaFor } from '@/lib/routeMeta';

/**
 * Keeps <link rel="canonical">, og:url, the document title and the description tags
 * in sync with the current route.
 * index.html ships the root canonical for crawlers that do not run JS;
 * this updates it per route for crawlers that do (e.g. Googlebot).
 */
export function CanonicalSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    const href = canonicalUrlFor(pathname);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
    document.head.querySelector('meta[property="og:url"]')?.setAttribute('content', href);

    const { title, description } = routeMetaFor(pathname);
    document.title = title;
    const setMeta = (selector: string, value: string) =>
      document.head.querySelector(selector)?.setAttribute('content', value);
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
  }, [pathname]);

  return null;
}
