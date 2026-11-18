import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '@/stores/settingsStore';
import { DEFAULT_SETTINGS } from '@/lib/constants';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState(DEFAULT_SETTINGS);
  });

  it('has correct default values', () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(state.showThumbnails).toBe(DEFAULT_SETTINGS.showThumbnails);
  });

  it('sets theme', () => {
    useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('sets show thumbnails', () => {
    useSettingsStore.getState().setShowThumbnails(false);
    expect(useSettingsStore.getState().showThumbnails).toBe(false);
  });

  it('sets analytics enabled', () => {
    useSettingsStore.getState().setAnalyticsEnabled(false);
    expect(useSettingsStore.getState().analyticsEnabled).toBe(false);
  });

  it('resets all settings to defaults', () => {
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().setShowThumbnails(false);

    useSettingsStore.getState().resetSettings();

    const state = useSettingsStore.getState();
    expect(state.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(state.showThumbnails).toBe(DEFAULT_SETTINGS.showThumbnails);
  });
});
