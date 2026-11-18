/**
 * Removes data that older Tooloqo builds wrote to local storage and this build no longer uses.
 * main.tsx calls it before the app renders, so it runs on every page of the shipped app.
 */
export const LEGACY_STORAGE_KEYS = ['tooloqo-files'] as const;

export function cleanupLegacyStorage(storage: Storage | undefined = globalThis.localStorage): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) storage?.removeItem(key);
  } catch {
    // Storage can be unavailable, for example in some private modes.
  }
}
