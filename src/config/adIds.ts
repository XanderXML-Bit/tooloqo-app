export function readAdIds(env: Record<string, string | undefined>, platform: 'android' | 'ios') {
  const prefix = `VITE_ADMOB_${platform.toUpperCase()}`;
  const appId = env[`${prefix}_APP_ID`]?.trim();
  const banner = env[`${prefix}_BANNER_ID`]?.trim();
  const interstitial = env[`${prefix}_INTERSTITIAL_ID`]?.trim();

  return appId && banner && interstitial ? { banner, interstitial } : null;
}
