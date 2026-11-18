import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Capacitor before importing
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
  },
}));

vi.mock('@/config/ads', () => ({
  getAdUnitId: vi.fn(() => 'test-ad-id'),
  isAdSupported: vi.fn(() => false),
  isUsingTestAds: vi.fn(() => true),
}));

describe('adService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports expected functions', async () => {
    const adService = await import('../../src/services/adService');
    expect(adService.initializeAds).toBeDefined();
    expect(adService.isAdsAvailable).toBeDefined();
    expect(adService.showBannerAd).toBeDefined();
    expect(adService.hideBannerAd).toBeDefined();
    expect(adService.removeBannerAd).toBeDefined();
    expect(adService.isBannerVisible).toBeDefined();
    expect(adService.showInterstitialAfterOperation).toBeDefined();
    expect(adService.forceShowInterstitial).toBeDefined();
    expect(adService.getBannerHeight).toBeDefined();
  });

  it('isAdsAvailable returns false on web', async () => {
    const { isAdsAvailable } = await import('../../src/services/adService');
    expect(isAdsAvailable()).toBe(false);
  });

  it('isBannerVisible returns false initially', async () => {
    const { isBannerVisible } = await import('../../src/services/adService');
    expect(isBannerVisible()).toBe(false);
  });

  it('getBannerHeight returns 0 on web', async () => {
    const { getBannerHeight } = await import('../../src/services/adService');
    expect(getBannerHeight()).toBe(0);
  });

  it('initializeAds returns false on web (no AdMob)', async () => {
    const { initializeAds } = await import('../../src/services/adService');
    const result = await initializeAds();
    expect(result).toBe(false);
  });

  it('showBannerAd returns false when not initialized', async () => {
    const { showBannerAd } = await import('../../src/services/adService');
    const result = await showBannerAd();
    expect(result).toBe(false);
  });

  it('hideBannerAd is safe to call when not initialized', async () => {
    const { hideBannerAd } = await import('../../src/services/adService');
    await expect(hideBannerAd()).resolves.toBeUndefined();
  });

  it('removeBannerAd is safe to call when not initialized', async () => {
    const { removeBannerAd } = await import('../../src/services/adService');
    await expect(removeBannerAd()).resolves.toBeUndefined();
  });

  it('showInterstitialAfterOperation returns false when not initialized', async () => {
    const { showInterstitialAfterOperation } = await import('../../src/services/adService');
    const result = await showInterstitialAfterOperation();
    expect(result).toBe(false);
  });

  it('forceShowInterstitial returns false when not initialized', async () => {
    const { forceShowInterstitial } = await import('../../src/services/adService');
    const result = await forceShowInterstitial();
    expect(result).toBe(false);
  });
});

describe('ads config', () => {
  it('getAdUnitId returns test IDs on web', async () => {
    const { getAdUnitId } = await import('../../src/config/ads');
    expect(getAdUnitId('banner')).toBeDefined();
    expect(typeof getAdUnitId('banner')).toBe('string');
  });

  it('isAdSupported returns boolean', async () => {
    const { isAdSupported } = await import('../../src/config/ads');
    expect(typeof isAdSupported()).toBe('boolean');
  });

  it('isUsingTestAds returns boolean', async () => {
    const { isUsingTestAds } = await import('../../src/config/ads');
    expect(typeof isUsingTestAds()).toBe('boolean');
  });
});
