import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'vitest-canvas-mock';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock Image class for image loading tests
// Simple mock that works with jsdom and vitest-canvas-mock
function MockImageConstructor(this: {
  onload: (() => void) | null;
  onerror: ((error: Error) => void) | null;
  src: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  complete: boolean;
}) {
  this.onload = null;
  this.onerror = null;
  this.width = 100;
  this.height = 100;
  this.naturalWidth = 100;
  this.naturalHeight = 100;
  this.complete = false;

  let _src = '';
  Object.defineProperty(this, 'src', {
    get: () => _src,
    set: (value: string) => {
      _src = value;
      if (value) {
        // Trigger onload asynchronously
        Promise.resolve().then(() => {
          this.complete = true;
          if (this.onload) {
            this.onload();
          }
        });
      }
    },
  });
}

// @ts-expect-error - Mock Image constructor
global.Image = MockImageConstructor;

// Mock canvas toBlob for testing
HTMLCanvasElement.prototype.toBlob = function(
  callback: BlobCallback,
  type?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _quality?: number
) {
  const blob = new Blob(['mock-image-data'], { type: type || 'image/png' });
  Promise.resolve().then(() => callback(blob));
};

// Mock canvas toDataURL
HTMLCanvasElement.prototype.toDataURL = function(type?: string) {
  return `data:${type || 'image/png'};base64,mockBase64Data`;
};

// Override getContext to make drawImage work with our mock Image
const originalGetContext = HTMLCanvasElement.prototype.getContext;
// @ts-expect-error - Override getContext signature
HTMLCanvasElement.prototype.getContext = function(
  contextId: string,
  options?: CanvasRenderingContext2DSettings
) {
  const ctx = originalGetContext.call(this, contextId, options);
  if (ctx && contextId === '2d') {
    // Replace drawImage with a version that accepts our mock
    // @ts-expect-error - Override drawImage
    ctx.drawImage = function() {
      // No-op for tests - just accept any arguments
      return undefined;
    };
  }
  return ctx;
};

// Mock Blob.arrayBuffer if not available (for jsdom)
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(this);
    });
  };
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
});
