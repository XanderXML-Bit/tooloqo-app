import { Capacitor } from '@capacitor/core';
import { readAdIds } from './adIds';

const TEST_AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
};

export function getAdConfig() {
  const platform = Capacitor.getPlatform();
  if (!Capacitor.isNativePlatform() || (platform !== 'android' && platform !== 'ios')) {
    return null;
  }

  const units = readAdIds(import.meta.env, platform);
  if (!units) return null;

  const testing = import.meta.env.DEV;
  return { ...(testing ? TEST_AD_UNITS[platform] : units), testing };
}
