/**
 * Ad Service for Tooloqo
 *
 * Handles AdMob integration for the utility toolkit app.
 *
 * Architecture:
 * - Banner ad at bottom of main screens (hidden during tool use)
 * - Interstitial ads shown occasionally after completing operations (with cooldown)
 * - Pro/ad-free users see no ads
 *
 * Usage:
 * - Call initializeAds() once on app startup
 * - Call showBannerAd() on main screens, hideBannerAd() during tool operations
 * - Call showInterstitialAfterOperation() after completing a tool operation
 */

import { getAdConfig } from '@/config/ads';

const adConfig = getAdConfig();

// ============================================================================
// DYNAMIC IMPORT - Prevents web build crashes
// ============================================================================

interface AdMobPlugin {
  initialize(options: { initializeForTesting: boolean }): Promise<unknown>;
  requestTrackingAuthorization(): Promise<unknown>;
  showBanner(options: { adId: string; adSize: unknown; position: unknown; margin: number; isTesting: boolean }): Promise<unknown>;
  hideBanner(): Promise<unknown>;
  resumeBanner(): Promise<unknown>;
  removeBanner(): Promise<unknown>;
  prepareInterstitial(options: { adId: string; isTesting: boolean }): Promise<unknown>;
  showInterstitial(): Promise<unknown>;
}

interface AdMobBannerAdSize {
  ADAPTIVE_BANNER: unknown;
  [key: string]: unknown;
}

interface AdMobBannerAdPosition {
  BOTTOM_CENTER: unknown;
  [key: string]: unknown;
}

let AdMob: AdMobPlugin | null = null;
let BannerAdSize: AdMobBannerAdSize = {} as AdMobBannerAdSize;
let BannerAdPosition: AdMobBannerAdPosition = {} as AdMobBannerAdPosition;

// Promise that resolves when AdMob module is loaded
let admobModuleLoaded: Promise<boolean>;

if (adConfig) {
  admobModuleLoaded = import('@capacitor-community/admob')
    .then((module) => {
      AdMob = module.AdMob as unknown as AdMobPlugin;
      BannerAdSize = module.BannerAdSize as unknown as AdMobBannerAdSize;
      BannerAdPosition = module.BannerAdPosition as unknown as AdMobBannerAdPosition;
      return true;
    })
    .catch((err) => {
      console.warn('[Ads] AdMob plugin not available:', err);
      return false;
    });
} else {
  admobModuleLoaded = Promise.resolve(false);
}

// ============================================================================
// STATE TRACKING
// ============================================================================

let adsInitialized = false;
let bannerCreated = false;
let bannerVisible = false;

// Interstitial cooldown (3 minutes for utility app - less intrusive)
const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;
let lastInterstitialTime = 0;

// Track operations for interstitial frequency (show every N operations)
const OPERATIONS_BETWEEN_ADS = 3;
let operationCount = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the AdMob SDK. Call once on app startup.
 */
export async function initializeAds(): Promise<boolean> {
  if (adsInitialized) return true;

  const moduleLoaded = await admobModuleLoaded;
  if (!moduleLoaded || !AdMob) {
    return false;
  }

  try {
    await AdMob.initialize({
      initializeForTesting: isUsingTestAds(),
    });

    if (import.meta.env.DEV) {
      console.log('[Ads] AdMob initialized');
      if (isUsingTestAds()) {
        console.log('[Ads] Using TEST ad units');
      }
    }

    adsInitialized = true;

    // Request tracking authorization (iOS 14+)
    try {
      await AdMob.requestTrackingAuthorization();
    } catch {
      // Expected to fail on Android
    }

    return true;
  } catch (error) {
    console.error('[Ads] Initialization failed:', error);
    return false;
  }
}

/**
 * Check if ads are initialized and available
 */
export function isAdsAvailable(): boolean {
  return adsInitialized;
}

// ============================================================================
// BANNER AD MANAGEMENT
// ============================================================================

/**
 * Show the banner ad at the bottom of the screen
 */
export async function showBannerAd(): Promise<boolean> {
  if (!AdMob || !adsInitialized || !adConfig) return false;
  if (bannerVisible) return true;

  try {
    if (!bannerCreated) {
      await AdMob.showBanner({
        adId: adConfig.banner,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: isUsingTestAds(),
      });
      bannerCreated = true;
    } else {
      await AdMob.resumeBanner();
    }

    bannerVisible = true;
    if (import.meta.env.DEV) console.log('[Ads] Banner shown');
    return true;
  } catch (error) {
    console.error('[Ads] Failed to show banner:', error);
    return false;
  }
}

/**
 * Hide the banner ad (call during tool operations for cleaner UI)
 */
export async function hideBannerAd(): Promise<void> {
  if (!AdMob || !bannerCreated || !bannerVisible) return;

  try {
    await AdMob.hideBanner();
    bannerVisible = false;
    if (import.meta.env.DEV) console.log('[Ads] Banner hidden');
  } catch (error) {
    console.error('[Ads] Failed to hide banner:', error);
  }
}

/**
 * Remove banner completely (for ad-free users)
 */
export async function removeBannerAd(): Promise<void> {
  if (!AdMob || !bannerCreated) return;

  try {
    await AdMob.removeBanner();
    bannerCreated = false;
    bannerVisible = false;
    if (import.meta.env.DEV) console.log('[Ads] Banner removed');
  } catch (error) {
    console.error('[Ads] Failed to remove banner:', error);
  }
}

/**
 * Check if banner is currently visible
 */
export function isBannerVisible(): boolean {
  return bannerVisible;
}

// ============================================================================
// INTERSTITIAL AD MANAGEMENT
// ============================================================================

/**
 * Check if enough time has passed since last interstitial
 */
function canShowInterstitial(): boolean {
  return Date.now() - lastInterstitialTime >= INTERSTITIAL_COOLDOWN_MS;
}

/**
 * Show an interstitial ad after completing a tool operation.
 * Respects cooldown and operation count to avoid being too intrusive.
 */
export async function showInterstitialAfterOperation(): Promise<boolean> {
  operationCount++;

  // Only show after every N operations and if cooldown passed
  if (operationCount < OPERATIONS_BETWEEN_ADS || !canShowInterstitial()) {
    if (import.meta.env.DEV) {
      console.log(`[Ads] Interstitial skipped (ops: ${operationCount}/${OPERATIONS_BETWEEN_ADS}, cooldown: ${canShowInterstitial()})`);
    }
    return false;
  }

  if (!AdMob || !adsInitialized || !adConfig) {
    return false;
  }

  try {
    await AdMob.prepareInterstitial({
      adId: adConfig.interstitial,
      isTesting: isUsingTestAds(),
    });

    await AdMob.showInterstitial();

    // Reset counters
    lastInterstitialTime = Date.now();
    operationCount = 0;

    if (import.meta.env.DEV) console.log('[Ads] Interstitial shown');
    return true;
  } catch (error) {
    console.error('[Ads] Interstitial error:', error);
    return false;
  }
}

/**
 * Force show an interstitial (ignores cooldown and operation count)
 * Use sparingly - only for specific scenarios like before export
 */
export async function forceShowInterstitial(): Promise<boolean> {
  if (!AdMob || !adsInitialized || !adConfig) return false;

  try {
    await AdMob.prepareInterstitial({
      adId: adConfig.interstitial,
      isTesting: isUsingTestAds(),
    });

    await AdMob.showInterstitial();
    lastInterstitialTime = Date.now();
    operationCount = 0;

    return true;
  } catch (error) {
    console.error('[Ads] Forced interstitial error:', error);
    return false;
  }
}

// ============================================================================
// SPACER COMPONENT HELPER
// ============================================================================

/**
 * Get the banner ad height for layout spacing
 * Returns 0 on web or when ads not supported
 */
export function getBannerHeight(): number {
  if (!adConfig) return 0;
  // Adaptive banner is typically 50-90px, use 60 as safe default
  return 60;
}

// ============================================================================
// EXPORTS
// ============================================================================

export function isAdSupported(): boolean {
  return adConfig !== null;
}

export function isUsingTestAds(): boolean {
  return adConfig?.testing ?? false;
}
