import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { resolveSiteOrigin } from './src/lib/site';
import { buildRobotsTxt, buildSitemapXml } from './src/lib/crawl';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const siteOrigin = resolveSiteOrigin(env.VITE_SITE_URL);
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'site-origin-metadata',
        transformIndexHtml: (html) => html.replaceAll('__SITE_ORIGIN__', siteOrigin),
      },
      {
        name: 'crawl-files',
        // Emitted at build time so both files name the same origin as the canonical tags.
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobotsTxt(siteOrigin) });
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(siteOrigin) });
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script-defer',
        includeAssets: ['favicon.svg', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'brand/mark.svg', 'brand/wordmark.svg'],
        manifest: {
          name: 'Tooloqo',
          short_name: 'Tooloqo',
          description: 'Image, PDF, media and text tools that run on your device',
          theme_color: '#08090d',
          background_color: '#08090d',
          display: 'standalone',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          ],
        },
        workbox: {
          // Static 404 page is for unknown server paths; never serve it as the SPA shell.
          globIgnores: ['**/404.html'],
          // A browser that opens these files directly gets the file, not the cached SPA shell.
          navigateFallbackDenylist: [/^\/(robots\.txt|sitemap\.xml)(\?|$)/],
          globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,woff2}'],
        }
      })
    ],
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        maxWorkers: 2,
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
          },
        },
      },
      chunkSizeWarningLimit: 900, // vendor-pdf (pdf-lib + pdfjs-dist) is ~828KB
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteOrigin),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
