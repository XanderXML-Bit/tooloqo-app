import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { invalidateSettingsCache } from '@/services/storageService';
import type { Theme } from '@/types';

/**
 * Hook for managing app settings
 * Provides a simplified interface to settingsStore with cache invalidation
 */
export function useSettings() {
  const store = useSettingsStore();

  const setTheme = useCallback((theme: Theme) => {
    store.setTheme(theme);
    invalidateSettingsCache();

    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [store]);

  return {
    theme: store.theme,
    setTheme,
  };
}
