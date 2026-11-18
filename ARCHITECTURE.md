# Tooloqo Architecture Guide

**Version:** 0.1.0
**Last Updated:** December 2024

This document provides a comprehensive technical overview of Tooloqo's architecture, component structure, state management patterns, and extension points for developers.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Project Structure](#project-structure)
3. [Application Flow](#application-flow)
4. [State Management](#state-management)
5. [Service Layer](#service-layer)
6. [Component Architecture](#component-architecture)
7. [Utility Systems](#utility-systems)
8. [Styling System](#styling-system)
9. [Extension Points](#extension-points)
10. [Performance Considerations](#performance-considerations)

---

## App Overview

Tooloqo is a **unified utility toolkit** that consolidates image, PDF, text, and media processing tools into a single privacy-focused application. The app is:

- **100% client-side** - No server for file processing, no analytics, no data collection
- **Offline-first** - All core features work without network
- **Battery-conscious** - Efficient processing with Web Workers where appropriate
- **Cross-platform** - PWA + Capacitor native wrappers

---

## Project Structure

```
tooloqo/
├── index.html                  # HTML entry, Tailwind CDN config, CSS variables
├── vite.config.ts              # Vite build configuration
├── capacitor.config.ts         # Capacitor native wrapper config
├── vitest.config.ts            # Vitest test configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
│
├── public/
│   └── sw.js                   # Service worker for offline support
│
├── src/
│   ├── main.tsx                # React DOM mounting point
│   ├── App.tsx                 # Root component with routing
│   ├── index.css               # Minimal global styles
│   │
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── index.ts        # Barrel exports
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── common/             # Shared components
│   │   │   ├── FileDropzone.tsx
│   │   │   ├── ProcessingIndicator.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── OfflineWarningBanner.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── tools/              # Tool-specific components
│   │       ├── image/
│   │       │   ├── ImageResize.tsx
│   │       │   ├── ImageCompress.tsx
│   │       │   ├── ImageCrop.tsx
│   │       │   ├── ImageConvert.tsx
│   │       │   ├── ImageRotate.tsx
│   │       │   └── index.ts
│   │       ├── pdf/
│   │       │   ├── PdfMerge.tsx
│   │       │   ├── PdfSplit.tsx
│   │       │   ├── PdfCompress.tsx
│   │       │   ├── ImageToPdf.tsx
│   │       │   ├── PdfToImage.tsx
│   │       │   └── index.ts
│   │       ├── text/
│   │       │   ├── WordCount.tsx
│   │       │   ├── CaseConvert.tsx
│   │       │   ├── TextCompare.tsx
│   │       │   └── index.ts
│   │       └── media/
│   │           ├── AudioConvert.tsx
│   │           ├── VideoCompress.tsx
│   │           └── index.ts
│   │
│   ├── hooks/
│   │   ├── useOfflineStatus.ts
│   │   ├── useSettings.ts
│   │   ├── useToast.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── imageService.ts     # Image processing
│   │   ├── pdfService.ts       # PDF processing
│   │   ├── textService.ts      # Text utilities
│   │   ├── storageService.ts   # LocalStorage with caching
│   │   ├── feedbackService.ts  # Sound and haptic feedback
│   │   └── index.ts
│   │
│   ├── stores/
│   │   ├── fileStore.ts        # File and job state
│   │   ├── settingsStore.ts    # App settings
│   │   ├── adStore.ts          # Ad-free purchase state
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── validation.ts       # Input validation
│   │   ├── helpers.ts          # Common helpers
│   │   └── index.ts
│   │
│   ├── config/
│   │   ├── constants.ts        # App constants
│   │   └── index.ts
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── ImageTools.tsx
│   │   ├── PdfTools.tsx
│   │   ├── TextTools.tsx
│   │   ├── MediaTools.tsx
│   │   ├── Settings.tsx
│   │   └── AdFree.tsx
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── lib/
│       └── utils.ts            # cn() utility for class merging
│
└── tests/
    ├── setup.ts                # Test setup with mocks
    ├── services/
    │   └── textService.test.ts
    └── utils/
        └── validation.test.ts
```

### File Purposes

| File | Responsibility |
|------|----------------|
| `index.html` | Entry point, Tailwind CDN config, CSS variables for theming, safe area styles |
| `App.tsx` | Main router using React Router v7, wraps with ErrorBoundary and Toast |
| `main.tsx` | React DOM mounting point |
| `services/*.ts` | Business logic for each tool category |
| `stores/*.ts` | Zustand stores with persist middleware |
| `hooks/*.ts` | Reusable React hooks |
| `config/constants.ts` | App name, version, storage keys, file limits |

---

## Application Flow

### Startup Sequence

```
1. index.html loads
   └── Tailwind CSS initialized via CDN
   └── CSS variables applied (dark mode default)
   └── Safe area styles set

2. main.tsx mounts App component
   └── React 19 root created

3. App.tsx initialization
   ├── ErrorBoundary wraps entire app
   ├── BrowserRouter sets up routing
   ├── Routes configured for all tools
   ├── ToastContainer mounted (listens for events)
   └── OfflineWarningBanner mounted (monitors connectivity)
```

### Navigation Model

Tooloqo uses React Router v7 for declarative routing:

```typescript
// Route structure
<Routes>
  <Route path="/" element={<Home />} />

  {/* Image Tools */}
  <Route path="/image" element={<ImageTools />} />
  <Route path="/image/resize" element={<ImageResize />} />
  <Route path="/image/compress" element={<ImageCompress />} />
  // ... more image routes

  {/* PDF Tools */}
  <Route path="/pdf" element={<PdfTools />} />
  <Route path="/pdf/merge" element={<PdfMerge />} />
  // ... more PDF routes

  {/* Other routes */}
  <Route path="/text" element={<TextTools />} />
  <Route path="/media" element={<MediaTools />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/ad-free" element={<AdFree />} />
</Routes>
```

---

## State Management

### Zustand Stores

Tooloqo uses Zustand for lightweight state management with persist middleware:

```typescript
// settingsStore.ts pattern
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      soundEnabled: true,
      hapticEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
    }),
    { name: 'tooloqo-settings' }
  )
);
```

### Storage Keys

All persistent data uses keys defined in `config/constants.ts`:

```typescript
export const STORAGE_KEYS = {
  SETTINGS: 'tooloqo_settings',
  THEME: 'tooloqo_theme',
  RECENT_FILES: 'tooloqo_recent_files',
  AD_FREE: 'tooloqo-ad-free',
  ONBOARDING_COMPLETE: 'tooloqo_onboarding',
  FILE_STORE: 'tooloqo-files',
  SETTINGS_STORE: 'tooloqo-settings',
} as const;
```

### Storage Caching Pattern

The storage service implements a 5-second cache TTL to reduce localStorage reads:

```typescript
// storageService.ts
const SETTINGS_CACHE_TTL = 5000;
let settingsCache: { data: CachedSettings | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

export function getCachedSettings(): CachedSettings {
  const now = Date.now();
  if (settingsCache.data && now - settingsCache.timestamp < SETTINGS_CACHE_TTL) {
    return settingsCache.data;
  }
  // Fetch from localStorage and update cache
  const settings = { /* ... */ };
  settingsCache = { data: settings, timestamp: now };
  return settings;
}
```

---

## Service Layer

### Image Service

Handles all image processing operations:

```typescript
// imageService.ts
export const imageService = {
  resize: async (file: File, options: ResizeOptions): Promise<Blob> => { /* ... */ },
  compress: async (file: File, quality: number): Promise<Blob> => { /* ... */ },
  crop: async (file: File, cropArea: CropArea): Promise<Blob> => { /* ... */ },
  convert: async (file: File, format: ImageFormat): Promise<Blob> => { /* ... */ },
  rotate: async (file: File, degrees: number): Promise<Blob> => { /* ... */ },
  flip: async (file: File, direction: 'horizontal' | 'vertical'): Promise<Blob> => { /* ... */ },
};
```

### PDF Service

Handles all PDF processing using pdf-lib and pdfjs-dist:

```typescript
// pdfService.ts
export const pdfService = {
  merge: async (files: File[]): Promise<Blob> => { /* ... */ },
  split: async (file: File, pages: number[]): Promise<Blob[]> => { /* ... */ },
  compress: async (file: File): Promise<Blob> => { /* ... */ },
  imagesToPdf: async (images: File[]): Promise<Blob> => { /* ... */ },
  pdfToImages: async (file: File): Promise<Blob[]> => { /* ... */ },
};
```

### Text Service

Pure functions for text processing:

```typescript
// textService.ts
export const textService = {
  countWords: (text: string): TextStats => { /* ... */ },
  convertCase: (text: string, caseType: CaseType): string => { /* ... */ },
  compareTexts: (text1: string, text2: string): DiffResult[] => { /* ... */ },
};
```

### Feedback Service

Sound and haptic feedback for interactions:

```typescript
// feedbackService.ts
export function playSound(type: 'click' | 'success' | 'error' | 'delete' | 'toggle'): void;
export function vibrate(pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void;

export const feedback = {
  tap: () => { playSound('click'); vibrate('light'); },
  success: () => { playSound('success'); vibrate('success'); },
  error: () => { playSound('error'); vibrate('error'); },
  delete: () => { playSound('delete'); vibrate('medium'); },
  toggle: () => { playSound('toggle'); vibrate('light'); },
};
```

---

## Component Architecture

### Layout Pattern

All tool pages follow a consistent layout:

```tsx
// Tool component pattern
function ImageResize() {
  return (
    <Layout>
      <Header title="Resize Image" showBack />
      <div className="flex-1 overflow-y-auto p-4">
        {/* Tool controls */}
        <FileDropzone onFiles={handleFiles} />
        {file && (
          <>
            <PreviewSection file={file} />
            <ControlsSection onChange={handleChange} />
            <ActionButtons onProcess={handleProcess} />
          </>
        )}
      </div>
    </Layout>
  );
}
```

### FileDropzone Pattern

Consistent file input across all tools:

```tsx
<FileDropzone
  accept={SUPPORTED_TYPES.IMAGE}
  maxSize={FILE_LIMITS.IMAGE_MAX_SIZE}
  onFiles={handleFiles}
  multiple={false}
/>
```

### Error Handling

All tools use try-catch with toast notifications:

```tsx
const handleProcess = async () => {
  try {
    setProcessing(true);
    const result = await imageService.resize(file, options);
    showToast('Image resized successfully', 'success');
    feedback.success();
  } catch (error) {
    showToast(error.message || 'Processing failed', 'error');
    feedback.error();
  } finally {
    setProcessing(false);
  }
};
```

### Toast Notification System

Event-driven toast system:

```typescript
// Toast.tsx - Container listens for events
useEffect(() => {
  const handler = (e: CustomEvent) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...e.detail }]);
  };
  window.addEventListener('tooloqo_toast', handler);
  return () => window.removeEventListener('tooloqo_toast', handler);
}, []);

// Usage anywhere in app
import { showToast } from '@/components/common/Toast';
showToast('File processed', 'success');
```

---

## Utility Systems

### Validation Utilities

```typescript
// validation.ts
export function validateImageFile(file: File, options?: ValidationOptions): ValidationResult;
export function validatePdfFile(file: File, options?: ValidationOptions): ValidationResult;
export function validateNumber(value: number, min: number, max: number, fieldName: string): ValidationResult;
export function isValidUrl(url: string): boolean;
export function isValidHexColor(color: string): boolean;
```

### Helper Utilities

```typescript
// helpers.ts
export function formatFileSize(bytes: number): string;
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T;
export function copyToClipboard(text: string): Promise<boolean>;
export function downloadBlob(blob: Blob, filename: string): void;
export function generateId(): string;
```

---

## Styling System

### Industrial Premium Design System

Tooloqo uses an "Industrial Premium" design system with deep navy backgrounds, gradient buttons, and subtle glow effects. The system supports both dark (default) and light modes.

### Color Palette

#### Primary Colors (Blue)
- `primary-50` through `primary-950` - Full scale
- `primary-500`: #3378ff (main blue)
- Used for: Primary buttons, links, active states

#### Accent Colors (Gold)
- `accent-400` through `accent-600`
- `accent-500`: #fbbf24 (gold)
- Used for: Premium CTAs, highlights

#### Surface Colors (Dark Mode Default)
- `background`: #0a0e17 (deepest navy)
- `surface`: #10141f
- `surface-elevated`: #161c2a
- `surface-highlight`: #1e2538

#### Text Hierarchy
- `text-primary`: #f1f5f9 (main text)
- `text-secondary`: #94a3b8 (supporting text)
- `text-tertiary`: #64748b (disabled/hints)

#### Tool Category Colors
- `tool-image`: #3b82f6 (blue)
- `tool-pdf`: #ef4444 (red)
- `tool-media`: #a855f7 (purple)
- `tool-text`: #22c55e (green)

### Typography

- **UI Font**: DM Sans (sans-serif)
- **Mono Font**: JetBrains Mono (technical values, code)

```css
font-family: 'DM Sans', var(--font-sans);
font-family: 'JetBrains Mono', var(--font-mono);
```

### Glow Effects

Shadow utilities for premium feel:

```css
.shadow-glow-primary { box-shadow: 0 0 20px rgba(51, 120, 255, 0.4); }
.shadow-glow-accent { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
.shadow-glow-success { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
.shadow-glow-error { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
```

### Animation Keyframes

```css
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
```

Usage:
```html
<Card className="animate-fade-in" />
<Card className="animate-scale-in" style={{ animationDelay: '50ms' }} />
```

### Component Variants

#### Button Variants
- `default`: Gradient blue with glow on hover
- `secondary`: Elevated surface
- `outline`: Transparent with border
- `ghost`: Minimal text button
- `destructive`: Red gradient
- `premium`: Gold gradient
- `success`: Green gradient
- `link`: Text only with underline

#### Button Sizes (Accessible)
- `sm`: h-8 (32px)
- `default`: h-11 (44px) - meets touch target requirements
- `lg`: h-12 (48px)
- `xl`: h-14 (56px)
- `icon`: h-11 w-11 (44px)

#### Card Variants
- `default`: Elevated surface with border
- `interactive`: Hover effects for clickable cards
- `premium`: Gradient border for premium content

### Tailwind Configuration

Tailwind is loaded via CDN in `index.html` with full color scales and utilities configured:

```javascript
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Full scales for primary, accent, success, error, warning
        // Surface colors for layering
        // Text hierarchy colors
        // Tool category colors
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(51, 120, 255, 0.4)',
        'glow-accent': '0 0 20px rgba(251, 191, 36, 0.4)',
        // ...more glow shadows
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
      },
    },
  },
};
```

### CSS Custom Properties

```css
:root {
  /* Light mode colors */
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text-primary: #0f172a;

  /* Safe areas for native */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

.dark {
  /* Industrial Premium dark theme */
  --color-background: #0a0e17;
  --color-surface: #10141f;
  --color-surface-elevated: #161c2a;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-primary-500: #3378ff;
  --color-accent-500: #fbbf24;
}

---

## Extension Points

### Adding a New Tool

1. **Create the component**
   ```tsx
   // src/components/tools/category/NewTool.tsx
   export function NewTool() {
     return (
       <Layout>
         <Header title="New Tool" showBack />
         {/* Tool implementation */}
       </Layout>
     );
   }
   ```

2. **Export from barrel**
   ```typescript
   // src/components/tools/category/index.ts
   export { NewTool } from './NewTool';
   ```

3. **Add route in App.tsx**
   ```tsx
   <Route path="/category/new-tool" element={<NewTool />} />
   ```

4. **Add navigation link**
   ```tsx
   // In CategoryTools.tsx
   <ToolCard to="/category/new-tool" icon={NewIcon} title="New Tool" />
   ```

### Adding a New Service

1. **Create the service**
   ```typescript
   // src/services/newService.ts
   export const newService = {
     operation: async (input: Input): Promise<Output> => {
       // Implementation
     },
   };
   ```

2. **Export from barrel**
   ```typescript
   // src/services/index.ts
   export * from './newService';
   ```

3. **Add tests**
   ```typescript
   // tests/services/newService.test.ts
   describe('newService', () => {
     it('should perform operation', async () => {
       // Test
     });
   });
   ```

---

## Performance Considerations

### Bundle Optimization

- Manual chunks for vendor code:
  - `vendor-react`: React, React DOM
  - `vendor-icons`: Lucide React
  - `vendor-pdf`: pdf-lib, pdfjs-dist (~800KB)

- Terser minification with console/debugger removal in production

### Image Processing

- Use Canvas API for efficient image manipulation
- Release object URLs after use: `URL.revokeObjectURL(url)`
- Compress images before processing when possible

### PDF Processing

- Load PDF documents lazily
- Process pages in chunks for large PDFs
- Clean up PDFDocumentProxy after use

### Memory Management

- Dispose blob URLs when components unmount
- Use `useEffect` cleanup functions
- Avoid storing large files in state

---

## Testing

### Test Environment

Vitest with jsdom environment:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

### Mock Setup

```typescript
// tests/setup.ts
// Mock localStorage
const storage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
  },
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
});
```

---

## Conclusion

Tooloqo's architecture prioritizes:

- **Simplicity**: Single-purpose components with clear responsibilities
- **Privacy**: No external data transmission for core features
- **Performance**: Efficient processing with proper cleanup
- **Extensibility**: Clear patterns for adding new tools and services
- **Testability**: Service layer enables unit testing without browser APIs

For feature documentation, see [README.md](./README.md).
For privacy details, see the in-app page at https://tooloqo.zendren.net/privacy.
