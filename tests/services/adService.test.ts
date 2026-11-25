import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Capacitor } from '@capacitor/core';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
}));

const adMob = {
  initialize: vi.fn().mockResolvedValue(undefined),
  requestTrackingAuthorization: vi.fn().mockResolvedValue(undefined),
  showBanner: vi.fn().mockResolvedValue(undefined),
  prepareInterstitial: vi.fn().mockResolvedValue(undefined),
  showInterstitial: vi.fn().mockResolvedValue(undefined),
};

const loadPlugin = vi.fn(() => ({
  AdMob: adMob,
  BannerAdSize: { ADAPTIVE_BANNER: 'adaptive' },
  BannerAdPosition: { BOTTOM_CENTER: 'bottom' },
}));

const adIds = {
  VITE_ADMOB_ANDROID_APP_ID: 'android-app',
  VITE_ADMOB_ANDROID_BANNER_ID: 'android-banner',
  VITE_ADMOB_ANDROID_INTERSTITIAL_ID: 'android-interstitial',
  VITE_ADMOB_IOS_APP_ID: 'ios-app',
  VITE_ADMOB_IOS_BANNER_ID: 'ios-banner',
  VITE_ADMOB_IOS_INTERSTITIAL_ID: 'ios-interstitial',
};

function setPlatform(platform: 'ios' | 'android' | 'web') {
  vi.mocked(Capacitor.getPlatform).mockReturnValue(platform);
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(platform !== 'web');
}

function setAdIds() {
  for (const [key, value] of Object.entries(adIds)) vi.stubEnv(key, value);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.doMock('@capacitor-community/admob', loadPlugin);
  for (const key of Object.keys(adIds)) vi.stubEnv(key, undefined);
  vi.stubEnv('DEV', false);
});

afterEach(() => {
  vi.doUnmock('@capacitor-community/admob');
  vi.unstubAllEnvs();
});

describe('adService', () => {
  it.each([
    { platform: 'android', development: false },
    { platform: 'ios', development: false },
    { platform: 'android', development: true },
  ] as const)('skips AdMob on unconfigured $platform (development: $development)', async ({
    platform,
    development,
  }) => {
    setPlatform(platform);
    vi.stubEnv('DEV', development);
    const ads = await import('@/services/adService');

    await expect(ads.initializeAds()).resolves.toBe(false);
    await expect(ads.showBannerAd()).resolves.toBe(false);
    await expect(ads.hideBannerAd()).resolves.toBeUndefined();
    await expect(ads.removeBannerAd()).resolves.toBeUndefined();
    await expect(ads.forceShowInterstitial()).resolves.toBe(false);
    for (let operation = 0; operation < 3; operation++) {
      await expect(ads.showInterstitialAfterOperation()).resolves.toBe(false);
    }

    expect(ads.isAdsAvailable()).toBe(false);
    expect(ads.isBannerVisible()).toBe(false);
    expect(ads.getBannerHeight()).toBe(0);
    await vi.dynamicImportSettled();
    expect(loadPlugin).not.toHaveBeenCalled();
  });

  it('skips the AdMob plugin on the web even with native IDs configured', async () => {
    setPlatform('web');
    setAdIds();
    const ads = await import('@/services/adService');

    await expect(ads.initializeAds()).resolves.toBe(false);
    expect(ads.getBannerHeight()).toBe(0);
    await vi.dynamicImportSettled();
    expect(loadPlugin).not.toHaveBeenCalled();
  });

  it.each(['APP_ID', 'BANNER_ID', 'INTERSTITIAL_ID'])('skips ads when Android %s is blank', async (id) => {
    setPlatform('android');
    setAdIds();
    vi.stubEnv(`VITE_ADMOB_ANDROID_${id}`, '   ');
    const ads = await import('@/services/adService');

    await expect(ads.initializeAds()).resolves.toBe(false);
    await vi.dynamicImportSettled();
    expect(loadPlugin).not.toHaveBeenCalled();
  });

  it.each(['android', 'ios'] as const)('uses the configured %s IDs in production', async (platform) => {
    setPlatform(platform);
    setAdIds();
    const ads = await import('@/services/adService');

    await expect(ads.initializeAds()).resolves.toBe(true);
    expect(ads.isAdsAvailable()).toBe(true);
    expect(adMob.initialize).toHaveBeenCalledWith({ initializeForTesting: false });
    await expect(ads.showBannerAd()).resolves.toBe(true);
    expect(adMob.showBanner).toHaveBeenCalledWith(expect.objectContaining({
      adId: `${platform}-banner`,
      isTesting: false,
    }));
    await expect(ads.showInterstitialAfterOperation()).resolves.toBe(false);
    await expect(ads.showInterstitialAfterOperation()).resolves.toBe(false);
    await expect(ads.showInterstitialAfterOperation()).resolves.toBe(true);
    expect(adMob.prepareInterstitial).toHaveBeenCalledWith({
      adId: `${platform}-interstitial`,
      isTesting: false,
    });
    expect(adMob.showInterstitial).toHaveBeenCalledOnce();
  });

  it('uses Google test units in configured development builds', async () => {
    setPlatform('android');
    setAdIds();
    vi.stubEnv('DEV', true);
    const ads = await import('@/services/adService');

    await expect(ads.initializeAds()).resolves.toBe(true);
    expect(adMob.initialize).toHaveBeenCalledWith({ initializeForTesting: true });
    await expect(ads.showBannerAd()).resolves.toBe(true);
    expect(adMob.showBanner).toHaveBeenCalledWith(expect.objectContaining({
      adId: 'ca-app-pub-3940256099942544/6300978111',
      isTesting: true,
    }));
  });
});
