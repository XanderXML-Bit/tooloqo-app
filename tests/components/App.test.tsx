import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';

// Mock all page components
vi.mock('@/pages/Home', () => ({
  Home: () => <div data-testid="home-page">Home</div>,
}));
vi.mock('@/pages/ImageTools', () => ({
  ImageTools: () => <div data-testid="image-tools-page">Image Tools</div>,
}));
vi.mock('@/pages/PdfTools', () => ({
  PdfTools: () => <div data-testid="pdf-tools-page">PDF Tools</div>,
}));
vi.mock('@/pages/MediaTools', () => ({
  MediaTools: () => <div data-testid="media-tools-page">Media Tools</div>,
}));
vi.mock('@/pages/TextTools', () => ({
  TextTools: () => <div data-testid="text-tools-page">Text Tools</div>,
}));
vi.mock('@/pages/Settings', () => ({
  Settings: () => <div data-testid="settings-page">Settings</div>,
}));
vi.mock('@/pages/AdFree', () => ({
  AdFree: () => <div data-testid="adfree-page">Ad Free</div>,
}));
vi.mock('@/pages/Privacy', () => ({
  Privacy: () => <div data-testid="privacy-page">Privacy</div>,
}));
vi.mock('@/pages/NotFound', () => ({
  NotFound: () => <div data-testid="not-found-page">Not Found</div>,
}));

// Mock tool components
vi.mock('@/components/tools/image', () => ({
  ImageResize: () => <div>ImageResize</div>,
  ImageCompress: () => <div>ImageCompress</div>,
  ImageCrop: () => <div>ImageCrop</div>,
  ImageConvert: () => <div>ImageConvert</div>,
  ImageRotate: () => <div>ImageRotate</div>,
}));

vi.mock('@/components/tools/text', () => ({
  WordCount: () => <div>WordCount</div>,
  CaseConvert: () => <div>CaseConvert</div>,
  TextCompare: () => <div>TextCompare</div>,
}));

vi.mock('@/components/tools/media', () => ({
  AudioConvert: () => <div>AudioConvert</div>,
  VideoCompress: () => <div>VideoCompress</div>,
  VideoToGif: () => <div>VideoToGif</div>,
  ExtractAudio: () => <div>ExtractAudio</div>,
}));

// Mock lazy-loaded PDF tools
vi.mock('@/components/tools/pdf/PdfMerge', () => ({
  PdfMerge: () => <div>PdfMerge</div>,
}));
vi.mock('@/components/tools/pdf/PdfSplit', () => ({
  PdfSplit: () => <div>PdfSplit</div>,
}));
vi.mock('@/components/tools/pdf/PdfCompress', () => ({
  PdfCompress: () => <div>PdfCompress</div>,
}));
vi.mock('@/components/tools/pdf/ImageToPdf', () => ({
  ImageToPdf: () => <div>ImageToPdf</div>,
}));
vi.mock('@/components/tools/pdf/PdfToImage', () => ({
  PdfToImage: () => <div>PdfToImage</div>,
}));

// Mock common components
vi.mock('@/components/common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/common/ToolErrorBoundary', () => ({
  ToolErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/common/Toast', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  showToast: vi.fn(),
}));
vi.mock('@/components/common/OfflineWarningBanner', () => ({
  OfflineWarningBanner: () => <div data-testid="offline-banner" />,
}));
vi.mock('@/components/common/ProcessingIndicator', () => ({
  ProcessingIndicator: ({ message }: { message: string }) => <div>{message}</div>,
}));

// Mock adStore
vi.mock('@/stores/adStore', () => ({
  useAdStore: (selector: (state: { isAdFree: () => boolean }) => unknown) =>
    selector({ isAdFree: () => true }),
}));

// Mock adService
vi.mock('@/services/adService', () => ({
  initializeAds: vi.fn().mockResolvedValue(false),
  showBannerAd: vi.fn().mockResolvedValue(undefined),
}));

describe('App', () => {
  it('renders home page at root path', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders image tools page at /image', async () => {
    window.history.pushState({}, '', '/image');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('image-tools-page')).toBeInTheDocument();
    });
  });

  it('renders pdf tools page at /pdf', async () => {
    window.history.pushState({}, '', '/pdf');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('pdf-tools-page')).toBeInTheDocument();
    });
  });

  it('renders media tools page at /media', async () => {
    window.history.pushState({}, '', '/media');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('media-tools-page')).toBeInTheDocument();
    });
  });

  it('renders text tools page at /text', async () => {
    window.history.pushState({}, '', '/text');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('text-tools-page')).toBeInTheDocument();
    });
  });

  it('renders settings page at /settings', async () => {
    window.history.pushState({}, '', '/settings');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });
  });

  it('renders not found page for unknown routes', async () => {
    window.history.pushState({}, '', '/unknown-route');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  it('renders toast container and offline banner', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
      expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    });
  });

  it('renders the privacy page at /privacy', async () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('privacy-page')).toBeInTheDocument();
    });
  });

  it('does not offer the in-app ad-free purchase on the web build', async () => {
    window.history.pushState({}, '', '/ad-free');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('adfree-page')).not.toBeInTheDocument();
  });
});
