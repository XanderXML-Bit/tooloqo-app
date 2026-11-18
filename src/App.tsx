import { lazy, Suspense, useEffect } from 'react';
import type React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { Capacitor } from '@capacitor/core';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToolErrorBoundary } from '@/components/common/ToolErrorBoundary';
import { ToastContainer } from '@/components/common/Toast';
import { OfflineWarningBanner } from '@/components/common/OfflineWarningBanner';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { CanonicalSync } from '@/components/common/CanonicalSync';
import { useAdStore } from '@/stores/adStore';
import { initializeAds, showBannerAd } from '@/services/adService';

// Tool screens are lazy loaded so the home route ships only what it renders.
const named = <K extends string>(load: () => Promise<Record<K, React.ComponentType>>, key: K) =>
  lazy(() => load().then((m) => ({ default: m[key] })));

// Secondary pages
const ImageTools = named(() => import('@/pages/ImageTools'), 'ImageTools');
const PdfTools = named(() => import('@/pages/PdfTools'), 'PdfTools');
const MediaTools = named(() => import('@/pages/MediaTools'), 'MediaTools');
const TextTools = named(() => import('@/pages/TextTools'), 'TextTools');
const Settings = named(() => import('@/pages/Settings'), 'Settings');
const AdFree = named(() => import('@/pages/AdFree'), 'AdFree');
const Privacy = named(() => import('@/pages/Privacy'), 'Privacy');

const loadImage = () => import('@/components/tools/image');
const ImageResize = named(loadImage, 'ImageResize');
const ImageCompress = named(loadImage, 'ImageCompress');
const ImageCrop = named(loadImage, 'ImageCrop');
const ImageConvert = named(loadImage, 'ImageConvert');
const ImageRotate = named(loadImage, 'ImageRotate');

// PDF Tools (lazy loaded - large bundle ~800KB)
const PdfMerge = lazy(() => import('@/components/tools/pdf/PdfMerge').then(m => ({ default: m.PdfMerge })));
const PdfSplit = lazy(() => import('@/components/tools/pdf/PdfSplit').then(m => ({ default: m.PdfSplit })));
const PdfCompress = lazy(() => import('@/components/tools/pdf/PdfCompress').then(m => ({ default: m.PdfCompress })));
const ImageToPdf = lazy(() => import('@/components/tools/pdf/ImageToPdf').then(m => ({ default: m.ImageToPdf })));
const PdfToImage = lazy(() => import('@/components/tools/pdf/PdfToImage').then(m => ({ default: m.PdfToImage })));

const loadText = () => import('@/components/tools/text');
const WordCount = named(loadText, 'WordCount');
const CaseConvert = named(loadText, 'CaseConvert');
const TextCompare = named(loadText, 'TextCompare');

// Media tools (FFmpeg itself is fetched on first use inside the components)
const loadMedia = () => import('@/components/tools/media');
const AudioConvert = named(loadMedia, 'AudioConvert');
const VideoCompress = named(loadMedia, 'VideoCompress');
const VideoToGif = named(loadMedia, 'VideoToGif');
const ExtractAudio = named(loadMedia, 'ExtractAudio');

// Loading fallbacks for lazy-loaded tools
function ToolLoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <ProcessingIndicator message="Loading..." />
    </div>
  );
}

function PdfLoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <ProcessingIndicator message="Loading PDF tools..." />
    </div>
  );
}

function App() {
  const isAdFree = useAdStore((state) => state.isAdFree);

  // Initialize ads on app startup
  useEffect(() => {
    if (isAdFree()) return; // Ad-free users don't need ads

    const initAds = async () => {
      const initialized = await initializeAds();
      if (initialized) {
        // Show banner on main screens
        await showBannerAd();
      }
    };

    // Initialize after a short delay to let app settle
    const timer = setTimeout(initAds, 1000);
    return () => clearTimeout(timer);
  }, [isAdFree]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CanonicalSync />
        <Suspense fallback={<ToolLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Image Tools */}
          <Route path="/image" element={<ImageTools />} />
          <Route path="/image/resize" element={<ToolErrorBoundary toolName="Image Resize"><ImageResize /></ToolErrorBoundary>} />
          <Route path="/image/compress" element={<ToolErrorBoundary toolName="Image Compress"><ImageCompress /></ToolErrorBoundary>} />
          <Route path="/image/crop" element={<ToolErrorBoundary toolName="Image Crop"><ImageCrop /></ToolErrorBoundary>} />
          <Route path="/image/convert" element={<ToolErrorBoundary toolName="Image Convert"><ImageConvert /></ToolErrorBoundary>} />
          <Route path="/image/rotate" element={<ToolErrorBoundary toolName="Image Rotate"><ImageRotate /></ToolErrorBoundary>} />

          {/* PDF Tools (lazy loaded) */}
          <Route path="/pdf" element={<PdfTools />} />
          <Route path="/pdf/merge" element={<ToolErrorBoundary toolName="PDF Merge"><Suspense fallback={<PdfLoadingFallback />}><PdfMerge /></Suspense></ToolErrorBoundary>} />
          <Route path="/pdf/split" element={<ToolErrorBoundary toolName="PDF Split"><Suspense fallback={<PdfLoadingFallback />}><PdfSplit /></Suspense></ToolErrorBoundary>} />
          <Route path="/pdf/compress" element={<ToolErrorBoundary toolName="PDF Compress"><Suspense fallback={<PdfLoadingFallback />}><PdfCompress /></Suspense></ToolErrorBoundary>} />
          <Route path="/pdf/image-to-pdf" element={<ToolErrorBoundary toolName="Image to PDF"><Suspense fallback={<PdfLoadingFallback />}><ImageToPdf /></Suspense></ToolErrorBoundary>} />
          <Route path="/pdf/pdf-to-image" element={<ToolErrorBoundary toolName="PDF to Image"><Suspense fallback={<PdfLoadingFallback />}><PdfToImage /></Suspense></ToolErrorBoundary>} />

          {/* Media Tools */}
          <Route path="/media" element={<MediaTools />} />
          <Route path="/media/audio-convert" element={<ToolErrorBoundary toolName="Audio Convert"><AudioConvert /></ToolErrorBoundary>} />
          <Route path="/media/video-compress" element={<ToolErrorBoundary toolName="Video Compress"><VideoCompress /></ToolErrorBoundary>} />
          <Route path="/media/video-to-gif" element={<ToolErrorBoundary toolName="Video to GIF"><VideoToGif /></ToolErrorBoundary>} />
          <Route path="/media/extract-audio" element={<ToolErrorBoundary toolName="Extract Audio"><ExtractAudio /></ToolErrorBoundary>} />

          {/* Text Tools */}
          <Route path="/text" element={<TextTools />} />
          <Route path="/text/word-count" element={<ToolErrorBoundary toolName="Word Counter"><WordCount /></ToolErrorBoundary>} />
          <Route path="/text/case-convert" element={<ToolErrorBoundary toolName="Case Convert"><CaseConvert /></ToolErrorBoundary>} />
          <Route path="/text/text-compare" element={<ToolErrorBoundary toolName="Text Compare"><TextCompare /></ToolErrorBoundary>} />

          {/* Other */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* The ad-free purchase is an in-app purchase, so it exists only in the native apps. */}
          <Route path="/ad-free" element={Capacitor.isNativePlatform() ? <AdFree /> : <NotFound />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <ToastContainer />
        <OfflineWarningBanner />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
