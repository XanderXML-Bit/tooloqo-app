import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  hasStorageItem,
  getCachedSettings,
  invalidateSettingsCache,
  getStorageUsage,
} from '@/services/storageService';

describe('storageService', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReset();
    vi.mocked(localStorage.setItem).mockReset();
    vi.mocked(localStorage.removeItem).mockReset();
    invalidateSettingsCache();
  });

  describe('getStorageItem', () => {
    it('returns parsed value from localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ name: 'test' }));
      const result = getStorageItem('key', { name: '' });
      expect(result).toEqual({ name: 'test' });
      expect(localStorage.getItem).toHaveBeenCalledWith('tooloqo_key');
    });

    it('returns default value when key not found', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const result = getStorageItem('missing', 'default');
      expect(result).toBe('default');
    });

    it('returns default value on corrupted JSON', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('not-json{');
      const result = getStorageItem('bad', 42);
      expect(result).toBe(42);
    });

    it('returns default value when localStorage throws', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Access denied');
      });
      const result = getStorageItem('key', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('setStorageItem', () => {
    it('stores JSON stringified value', () => {
      const result = setStorageItem('key', { a: 1 });
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('tooloqo_key', '{"a":1}');
    });

    it('returns false on quota exceeded', () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw quotaError;
      });
      const result = setStorageItem('key', 'value');
      expect(result).toBe(false);
    });
  });

  describe('removeStorageItem', () => {
    it('removes prefixed key', () => {
      removeStorageItem('key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('tooloqo_key');
    });
  });

  describe('hasStorageItem', () => {
    it('returns true when key exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('something');
      expect(hasStorageItem('key')).toBe(true);
    });

    it('returns false when key missing', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(hasStorageItem('key')).toBe(false);
    });
  });

  describe('getCachedSettings', () => {
    it('reads settings from localStorage on first call', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const settings = getCachedSettings();
      expect(settings).toEqual({ theme: 'dark' });
    });

    it('returns cached value on subsequent calls', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      getCachedSettings();
      getCachedSettings();
      // The first call reads the theme once. The second call uses the cache.
      const callCount = vi.mocked(localStorage.getItem).mock.calls.length;
      expect(callCount).toBe(1);
    });

    it('refreshes after invalidation', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      getCachedSettings();
      invalidateSettingsCache();
      getCachedSettings();
      expect(vi.mocked(localStorage.getItem).mock.calls.length).toBe(2);
    });
  });

  describe('getStorageUsage', () => {
    it('returns usage stats', () => {
      const usage = getStorageUsage();
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(usage.available).toBeGreaterThanOrEqual(0);
    });
  });

});
