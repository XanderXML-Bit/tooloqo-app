/**
 * Animation timing constants and utilities for consistent staggered animations.
 * Caps animation delays to prevent performance issues on mobile with large lists.
 */

/** Animation timing constants */
export const ANIMATION = {
  /** Base delay before first stagger (ms) */
  BASE_DELAY: 150,
  /** Delay increment per item (ms) */
  STAGGER_INCREMENT: 50,
  /** Maximum items to stagger (performance cap) */
  MAX_STAGGER_ITEMS: 10,
} as const;

/**
 * Calculate staggered animation delay for list items.
 * Caps at MAX_STAGGER_ITEMS to prevent performance issues on mobile.
 *
 * @param index - Item index (0-based)
 * @returns Delay in milliseconds
 *
 * @example
 * // Items 0-9: 150ms, 200ms, 250ms... 600ms
 * // Items 10+: All 650ms (capped)
 * style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
 */
export function getStaggerDelay(index: number): number {
  const cappedIndex = Math.min(index, ANIMATION.MAX_STAGGER_ITEMS);
  return ANIMATION.BASE_DELAY + cappedIndex * ANIMATION.STAGGER_INCREMENT;
}
