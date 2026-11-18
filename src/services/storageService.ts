/**
 * Storage service with caching and quota management
 * Safe, cached localStorage access
 */

const STORAGE_PREFIX = 'tooloqo_';

/** Approximate localStorage limit in bytes (typical browser default) */
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;

// Cache for frequently accessed settings
interface CachedSettings {
  theme?: string;
}

let settingsCache: CachedSettings | null = null;
let settingsCacheTime = 0;
const SETTINGS_CACHE_TTL = 5000; // 5-second cache

/**
 * Safe JSON parse with default value
 */
function safeJsonParse<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Get item from localStorage with type safety
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return safeJsonParse(raw, defaultValue);
  } catch (e) {
    console.warn(`Failed to read ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with error handling
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to write ${key}:`, e);
    // Handle quota exceeded
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      handleQuotaExceeded();
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.warn(`Failed to remove ${key}:`, e);
  }
}

/**
 * Check if item exists in localStorage
 */
export function hasStorageItem(key: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  } catch {
    return false;
  }
}

/**
 * Get cached settings (reduces localStorage hits)
 */
export function getCachedSettings(): CachedSettings {
  const now = Date.now();
  if (settingsCache && now - settingsCacheTime < SETTINGS_CACHE_TTL) {
    return settingsCache;
  }

  settingsCache = {
    theme: getStorageItem('settings_theme', 'dark'),
  };
  settingsCacheTime = now;
  return settingsCache;
}

/**
 * Invalidate settings cache
 */
export function invalidateSettingsCache(): void {
  settingsCache = null;
  settingsCacheTime = 0;
}

/**
 * Handle quota exceeded by clearing old data
 */
function handleQuotaExceeded(): void {
  console.warn('Storage quota exceeded, clearing old data...');

  // Clear recent files first
  removeStorageItem('recent_files');

  // Clear processing history
  removeStorageItem('processing_history');

  // Show user notification (will be handled by toast system)
  const event = new CustomEvent('tooloqo_toast', {
    detail: {
      id: `toast-quota-${Date.now()}`,
      message: 'Storage full. Old files have been cleared.',
      type: 'warning',
    },
  });
  window.dispatchEvent(event);
}

/**
 * Get approximate storage usage
 */
export function getStorageUsage(): { used: number; available: number } {
  let used = 0;

  try {
    for (const key in localStorage) {
      if (key.startsWith(STORAGE_PREFIX)) {
        used += localStorage.getItem(key)?.length ?? 0;
      }
    }
  } catch {
    // Ignore errors
  }

  const available = STORAGE_LIMIT_BYTES - used;

  return { used, available: Math.max(0, available) };
}
