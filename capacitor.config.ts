import type { CapacitorConfig } from '@capacitor/cli';
import { loadEnv } from 'vite';
import { readAdIds } from './src/config/adIds.ts';

const adEnv = loadEnv('production', process.cwd(), 'VITE_ADMOB_');
const basePlugins = ['@capacitor/filesystem', '@capacitor/share'];

function pluginsFor(platform: 'android' | 'ios') {
  return readAdIds(adEnv, platform)
    ? [...basePlugins, '@capacitor-community/admob']
    : basePlugins;
}

const config: CapacitorConfig = {
  appId: 'app.tooloqo',
  appName: 'Tooloqo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
  },
  ios: {
    includePlugins: pluginsFor('ios'),
    contentInset: 'automatic',
  },
  android: {
    includePlugins: pluginsFor('android'),
    allowMixedContent: true,
  },
};

export default config;
