import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppBridge } from '@/api/AppBridge';

// Mock services
vi.mock('@/services/imageService', () => ({
  imageService: {
    resize: vi.fn().mockResolvedValue(new Blob(['resized'])),
    compress: vi.fn().mockResolvedValue(new Blob(['compressed'])),
    convert: vi.fn().mockResolvedValue(new Blob(['converted'])),
    rotate: vi.fn().mockResolvedValue(new Blob(['rotated'])),
  },
}));

vi.mock('@/services/pdfService', () => ({
  pdfService: {
    merge: vi.fn().mockResolvedValue(new Blob(['merged'])),
    split: vi.fn().mockResolvedValue(new Blob(['split'])),
    compress: vi.fn().mockResolvedValue(new Blob(['compressed'])),
  },
}));

vi.mock('@/services/textService', () => ({
  textService: {
    wordCount: vi.fn().mockReturnValue({
      characters: 11,
      words: 2,
      sentences: 1,
      paragraphs: 1,
    }),
    convertCase: vi.fn().mockReturnValue('HELLO'),
    compareTexts: vi.fn().mockReturnValue([{ type: 'equal', value: 'same' }]),
  },
}));

describe('AppBridge', () => {
  let bridge: AppBridge;

  beforeEach(() => {
    // Reset singleton by accessing private static
    // @ts-expect-error access private static for test reset
    AppBridge.instance = undefined;
    bridge = AppBridge.getInstance();
  });

  describe('singleton', () => {
    it('returns the same instance', () => {
      const a = AppBridge.getInstance();
      const b = AppBridge.getInstance();
      expect(a).toBe(b);
    });

    it('has inspector and recorder', () => {
      expect(bridge.inspector).toBeTruthy();
      expect(bridge.recorder).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('starts on home page', () => {
      expect(bridge.currentPage).toBe('home');
    });

    it('navigate changes current page', () => {
      const result = bridge.navigate('image-tools');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('image-tools');
      expect(bridge.currentPage).toBe('image-tools');
    });

    it('navigate clears active tool', () => {
      bridge.selectTool('resize');
      bridge.navigate('home');
      expect(bridge.activeTool).toBeNull();
    });

    it('selectTool sets active tool', () => {
      const result = bridge.selectTool('resize');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('resize');
      expect(bridge.activeTool).toBe('resize');
    });
  });

  describe('file management', () => {
    it('starts with no files', () => {
      expect(bridge.getLoadedFiles()).toHaveLength(0);
    });

    it('loadFiles adds files', () => {
      const files = [
        {
          id: '1',
          originalName: 'test.png',
          mimeType: 'image/png',
          size: 100,
          blob: new Blob(['test']),
          createdAt: new Date(),
        },
      ];
      const result = bridge.loadFiles(files);
      expect(result.ok).toBe(true);
      expect(bridge.getLoadedFiles()).toHaveLength(1);
    });

    it('loadFiles accumulates files', () => {
      const file1 = {
        id: '1',
        originalName: 'a.png',
        mimeType: 'image/png',
        size: 100,
        blob: new Blob(),
        createdAt: new Date(),
      };
      const file2 = {
        id: '2',
        originalName: 'b.png',
        mimeType: 'image/png',
        size: 200,
        blob: new Blob(),
        createdAt: new Date(),
      };
      bridge.loadFiles([file1]);
      bridge.loadFiles([file2]);
      expect(bridge.getLoadedFiles()).toHaveLength(2);
    });

    it('clearFiles removes all files', () => {
      bridge.loadFiles([{
        id: '1',
        originalName: 'test.png',
        mimeType: 'image/png',
        size: 100,
        blob: new Blob(),
        createdAt: new Date(),
      }]);
      bridge.clearFiles();
      expect(bridge.getLoadedFiles()).toHaveLength(0);
    });

    it('getLoadedFiles returns a copy', () => {
      const files = bridge.getLoadedFiles();
      files.push({
        id: 'x',
        originalName: 'x.png',
        mimeType: 'image/png',
        size: 0,
        blob: new Blob(),
        createdAt: new Date(),
      });
      expect(bridge.getLoadedFiles()).toHaveLength(0);
    });
  });

  describe('text tools', () => {
    it('wordCount returns stats', () => {
      const result = bridge.wordCount('hello world');
      expect(result.ok).toBe(true);
      expect(result.data?.words).toBe(2);
    });

    it('caseConvert transforms text', () => {
      const result = bridge.caseConvert('hello', 'upper');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('HELLO');
    });

    it('textCompare compares texts', () => {
      const result = bridge.textCompare('a', 'a');
      expect(result.ok).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('image tools', () => {
    it('imageResize calls imageService.resize', async () => {
      const blob = new Blob(['image']);
      const result = await bridge.imageResize(blob, {
        width: 100,
        height: 100,
        maintainAspectRatio: true,
      });
      expect(result.ok).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('imageCompress calls imageService.compress', async () => {
      const blob = new Blob(['image']);
      const result = await bridge.imageCompress(blob, { quality: 80 });
      expect(result.ok).toBe(true);
    });

    it('imageConvert calls imageService.convert', async () => {
      const blob = new Blob(['image']);
      const result = await bridge.imageConvert(blob, { format: 'webp' });
      expect(result.ok).toBe(true);
    });

    it('imageRotate calls imageService.rotate', async () => {
      const blob = new Blob(['image']);
      const result = await bridge.imageRotate(blob, { degrees: 90 });
      expect(result.ok).toBe(true);
    });
  });

  describe('PDF tools', () => {
    it('pdfMerge merges files', async () => {
      const result = await bridge.pdfMerge([new Blob(), new Blob()]);
      expect(result.ok).toBe(true);
    });

    it('pdfSplit splits file', async () => {
      const result = await bridge.pdfSplit(new Blob(), [1, 2]);
      expect(result.ok).toBe(true);
    });

    it('pdfCompress compresses file', async () => {
      const result = await bridge.pdfCompress(new Blob());
      expect(result.ok).toBe(true);
    });
  });

  describe('state', () => {
    it('getState returns full state including navigation', () => {
      bridge.navigate('text-tools');
      const state = bridge.getState();
      expect(state.currentPage).toBe('text-tools');
      expect(state.loadedFiles).toBe(0);
    });

    it('getActionHistory returns recorder history', () => {
      bridge.navigate('home');
      const history = bridge.getActionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].method).toBe('navigate');
    });
  });
});
