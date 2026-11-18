import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, Theme } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsState extends AppSettings {
  setTheme: (theme: Theme) => void;
  setShowThumbnails: (show: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      setShowThumbnails: (showThumbnails) => set({ showThumbnails }),

      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'tooloqo-settings',
      // Only the theme is a setting the user can change, so it is the only value saved.
      // Version 1 drops the fields older builds saved (autoCleanup, maxRecentFiles and others).
      version: 1,
      partialize: (state) => ({ theme: state.theme }),
      migrate: (persisted) => ({ theme: (persisted as Partial<AppSettings> | undefined)?.theme ?? DEFAULT_SETTINGS.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}
