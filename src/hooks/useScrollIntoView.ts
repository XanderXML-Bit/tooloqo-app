import { useEffect, useRef } from 'react';

/**
 * Scrolls the referenced element into view when `trigger` becomes truthy or changes.
 * Tools use it so a result or error that renders below the fold is not missed on a phone.
 * `block: 'nearest'` leaves the page still when the element is already visible.
 */
export function useScrollIntoView<T extends HTMLElement>(trigger: unknown = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!trigger || !el || typeof el.scrollIntoView !== 'function') return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    el.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [trigger]);
  return ref;
}
