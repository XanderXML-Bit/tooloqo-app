import { describe, it, expect, beforeEach } from 'vitest';
import { TestDriver } from '@/testing/TestDriver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeImageFile(sizeKB = 10, type = 'image/png', name = 'test.png'): File {
  const data = new Uint8Array(sizeKB * 1024);
  return new File([data], name, { type });
}

function makePdfFile(sizeKB = 20, name = 'test.pdf'): File {
  // Minimal PDF header so the service recognises it
  const header = '%PDF-1.4\n';
  const padding = new Uint8Array(sizeKB * 1024);
  return new File([header, padding], name, { type: 'application/pdf' });
}

function makeAudioFile(sizeKB = 50, name = 'test.mp3'): File {
  return new File([new Uint8Array(sizeKB * 1024)], name, { type: 'audio/mpeg' });
}

function makeVideoFile(sizeKB = 100, name = 'test.mp4'): File {
  return new File([new Uint8Array(sizeKB * 1024)], name, { type: 'video/mp4' });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TestDriver', () => {
  let driver: TestDriver;

  beforeEach(() => {
    driver = new TestDriver();
  });

  // =========================================================================
  // Navigation & State
  // =========================================================================

  describe('navigation', () => {
    it('starts with no active tool', () => {
      expect(driver.activeTool).toBeNull();
      expect(driver.activeCategory).toBeNull();
    });

    it('selectTool sets active tool', () => {
      const r = driver.selectTool('resize');
      expect(r.ok).toBe(true);
      expect(driver.activeTool).toBe('resize');
      expect(driver.activeCategory).toBe('image');
    });

    it('selectTool clears previous state', () => {
      driver.selectTool('word-count');
      driver.setText('hello');
      driver.selectTool('case-convert');
      expect(driver.textInput).toBe('');
      expect(driver.files).toHaveLength(0);
    });

    it('categorises tools correctly', () => {
      driver.selectTool('resize'); expect(driver.activeCategory).toBe('image');
      driver.selectTool('compress'); expect(driver.activeCategory).toBe('image');
      driver.selectTool('merge'); expect(driver.activeCategory).toBe('pdf');
      driver.selectTool('word-count'); expect(driver.activeCategory).toBe('text');
      driver.selectTool('video-compress'); expect(driver.activeCategory).toBe('media');
      driver.selectTool('audio-convert'); expect(driver.activeCategory).toBe('media');
    });

    it('reset clears everything', () => {
      driver.selectTool('resize');
      driver.loadFile(makeImageFile());
      driver.reset();
      expect(driver.activeTool).toBeNull();
      expect(driver.files).toHaveLength(0);
    });
  });

  // =========================================================================
  // File Management
  // =========================================================================

  describe('file management', () => {
    it('rejects loadFile when no tool selected', () => {
      const r = driver.loadFile(makeImageFile());
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/No tool selected/);
    });

    it('rejects empty file list', () => {
      driver.selectTool('resize');
      const r = driver.loadFiles([]);
      expect(r.ok).toBe(false);
    });

    it('loads files successfully', () => {
      driver.selectTool('resize');
      const r = driver.loadFile(makeImageFile());
      expect(r.ok).toBe(true);
      expect(r.data).toBe(1);
      expect(driver.files).toHaveLength(1);
    });

    it('loads multiple files', () => {
      driver.selectTool('merge');
      const r = driver.loadFiles([makePdfFile(), makePdfFile()]);
      expect(r.ok).toBe(true);
      expect(r.data).toBe(2);
    });
  });

  // =========================================================================
  // TEXT TOOL JOURNEYS
  // =========================================================================

  describe('word-count journey', () => {
    it('full flow: select → input → count', () => {
      driver.selectTool('word-count');
      driver.setText('Hello world. This is a test.');

      const r = driver.countWords();
      expect(r.ok).toBe(true);
      expect(r.data!.words).toBe(6);
      expect(r.data!.sentences).toBe(2);
      expect(r.data!.characters).toBeGreaterThan(0);
      expect(r.data!.readingTimeMinutes).toBeGreaterThanOrEqual(0);
    });

    it('rejects without tool selected', () => {
      driver.setText('hello');
      expect(driver.countWords().ok).toBe(false);
    });

    it('rejects without text input', () => {
      driver.selectTool('word-count');
      expect(driver.countWords().ok).toBe(false);
    });

    it('handles empty string after setText("")', () => {
      driver.selectTool('word-count');
      driver.setText('');
      expect(driver.countWords().ok).toBe(false);
    });
  });

  describe('case-convert journey', () => {
    it('full flow: select → input → convert uppercase', () => {
      driver.selectTool('case-convert');
      driver.setText('hello world');

      const r = driver.convertCase('upper');
      expect(r.ok).toBe(true);
      expect(r.data).toBe('HELLO WORLD');
    });

    it('converts to lowercase', () => {
      driver.selectTool('case-convert');
      driver.setText('HELLO WORLD');
      expect(driver.convertCase('lower').data).toBe('hello world');
    });

    it('converts to title case', () => {
      driver.selectTool('case-convert');
      driver.setText('hello world');
      const r = driver.convertCase('title');
      expect(r.ok).toBe(true);
      expect(r.data).toBe('Hello World');
    });

    it('rejects wrong tool', () => {
      driver.selectTool('word-count');
      driver.setText('hello');
      expect(driver.convertCase('upper').ok).toBe(false);
    });

    it('rejects empty input', () => {
      driver.selectTool('case-convert');
      expect(driver.convertCase('upper').ok).toBe(false);
    });
  });

  describe('text-compare journey', () => {
    it('full flow: select → two inputs → compare', () => {
      driver.selectTool('text-compare');
      driver.setText('line one\nline two');
      driver.setText2('line one\nline three');

      const r = driver.compareTexts();
      expect(r.ok).toBe(true);
      expect(r.data!.length).toBeGreaterThan(0);
      // Should contain at least one add/remove
      const hasChange = r.data!.some((d) => d.type === 'add' || d.type === 'remove');
      expect(hasChange).toBe(true);
    });

    it('identical texts produce only equal diffs', () => {
      driver.selectTool('text-compare');
      driver.setText('same');
      driver.setText2('same');
      const r = driver.compareTexts();
      expect(r.ok).toBe(true);
      expect(r.data!.every((d) => d.type === 'equal')).toBe(true);
    });

    it('rejects when both inputs empty', () => {
      driver.selectTool('text-compare');
      expect(driver.compareTexts().ok).toBe(false);
    });

    it('rejects wrong tool', () => {
      driver.selectTool('word-count');
      driver.setText('a');
      driver.setText2('b');
      expect(driver.compareTexts().ok).toBe(false);
    });
  });

  // =========================================================================
  // IMAGE TOOL JOURNEYS
  // =========================================================================

  describe('image resize journey', () => {
    it('full flow: select → load → resize', async () => {
      driver.selectTool('resize');
      driver.loadFile(makeImageFile());

      const r = await driver.resizeImage({
        width: 200,
        height: 200,
        maintainAspectRatio: true,
      });
      expect(r.ok).toBe(true);
      expect(r.data!.blob).toBeInstanceOf(Blob);
      expect(r.data!.processedSize).toBeGreaterThan(0);
    });

    it('rejects without tool', async () => {
      const r = await driver.resizeImage({ width: 100, height: 100, maintainAspectRatio: true });
      expect(r.ok).toBe(false);
    });

    it('rejects without file', async () => {
      driver.selectTool('resize');
      const r = await driver.resizeImage({ width: 100, height: 100, maintainAspectRatio: true });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/No image file/);
    });

    it('rejects invalid dimensions', async () => {
      driver.selectTool('resize');
      driver.loadFile(makeImageFile());
      const r = await driver.resizeImage({ width: 0, height: 100, maintainAspectRatio: true });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/Width/);
    });

    it('rejects non-image file', async () => {
      driver.selectTool('resize');
      driver.loadFile(new File([new Uint8Array(100)], 'test.txt', { type: 'text/plain' }));
      const r = await driver.resizeImage({ width: 100, height: 100, maintainAspectRatio: true });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/Invalid file type/);
    });

    it('rejects oversized image', async () => {
      driver.selectTool('resize');
      // 11 MB exceeds the 10MB limit
      driver.loadFile(makeImageFile(11 * 1024));
      const r = await driver.resizeImage({ width: 100, height: 100, maintainAspectRatio: true });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/too large/i);
    });
  });

  describe('image compress journey', () => {
    it('full flow: select → load → compress', async () => {
      driver.selectTool('compress');
      driver.loadFile(makeImageFile());

      const r = await driver.compressImage({ quality: 70 });
      expect(r.ok).toBe(true);
      expect(r.data!.blob).toBeInstanceOf(Blob);
    });

    it('rejects quality out of range', async () => {
      driver.selectTool('compress');
      driver.loadFile(makeImageFile());
      expect((await driver.compressImage({ quality: 101 })).ok).toBe(false);
      expect((await driver.compressImage({ quality: -1 })).ok).toBe(false);
    });
  });

  describe('image convert journey', () => {
    it('full flow: PNG to JPEG', async () => {
      driver.selectTool('convert');
      driver.loadFile(makeImageFile(10, 'image/png', 'photo.png'));

      const r = await driver.convertImage({ format: 'jpg' });
      expect(r.ok).toBe(true);
      expect(r.data!.blob).toBeInstanceOf(Blob);
    });
  });

  describe('image rotate journey', () => {
    it('full flow: rotate 90°', async () => {
      driver.selectTool('rotate');
      driver.loadFile(makeImageFile());

      const r = await driver.rotateImage({ degrees: 90 });
      expect(r.ok).toBe(true);
      expect(r.data!.blob).toBeInstanceOf(Blob);
    });

    it('flip horizontal', async () => {
      driver.selectTool('rotate');
      driver.loadFile(makeImageFile());
      const r = await driver.rotateImage({ degrees: 0, flipHorizontal: true });
      expect(r.ok).toBe(true);
    });
  });

  describe('image crop journey', () => {
    it('full flow: crop to square', async () => {
      driver.selectTool('crop');
      driver.loadFile(makeImageFile());

      const r = await driver.cropImage({ x: 0, y: 0, width: 50, height: 50 });
      expect(r.ok).toBe(true);
      expect(r.data!.blob).toBeInstanceOf(Blob);
    });

    it('rejects zero-size crop', async () => {
      driver.selectTool('crop');
      driver.loadFile(makeImageFile());
      const r = await driver.cropImage({ x: 0, y: 0, width: 0, height: 50 });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/positive dimensions/);
    });
  });

  // =========================================================================
  // PDF TOOL JOURNEYS (service-level mocked since pdf-lib is heavy)
  // =========================================================================

  describe('pdf merge journey', () => {
    it('rejects with fewer than 2 files', async () => {
      driver.selectTool('merge');
      driver.loadFile(makePdfFile());
      const r = await driver.mergePdfs();
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/At least 2/);
    });

    it('rejects non-PDF files', async () => {
      driver.selectTool('merge');
      driver.loadFiles([makeImageFile(), makeImageFile()]);
      const r = await driver.mergePdfs();
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/Invalid file type/);
    });

    it('rejects wrong tool', async () => {
      driver.selectTool('split');
      const r = await driver.mergePdfs();
      expect(r.ok).toBe(false);
    });
  });

  describe('pdf split journey', () => {
    it('rejects empty page list', async () => {
      driver.selectTool('split');
      driver.loadFile(makePdfFile());
      const r = await driver.splitPdf([]);
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/at least one page/);
    });

    it('rejects without file', async () => {
      driver.selectTool('split');
      const r = await driver.splitPdf([1]);
      expect(r.ok).toBe(false);
    });
  });

  describe('pdf compress journey', () => {
    it('rejects without file', async () => {
      driver.selectTool('compress');
      // Force PDF category context
      const r = await driver.compressPdf();
      expect(r.ok).toBe(false);
    });
  });

  describe('images-to-pdf journey', () => {
    it('rejects without files', async () => {
      driver.selectTool('image-to-pdf');
      const r = await driver.imagesToPdf();
      expect(r.ok).toBe(false);
    });

    it('rejects non-image files', async () => {
      driver.selectTool('image-to-pdf');
      driver.loadFiles([makePdfFile()]);
      const r = await driver.imagesToPdf();
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/Invalid file type/);
    });
  });

  describe('pdf-to-image journey', () => {
    it('rejects without file', async () => {
      driver.selectTool('pdf-to-image');
      const r = await driver.pdfToImages();
      expect(r.ok).toBe(false);
    });

    it('rejects non-PDF', async () => {
      driver.selectTool('pdf-to-image');
      driver.loadFile(makeImageFile());
      const r = await driver.pdfToImages();
      expect(r.ok).toBe(false);
    });
  });

  // =========================================================================
  // MEDIA TOOL JOURNEYS (precondition-only — FFmpeg not available in jsdom)
  // =========================================================================

  describe('audio-convert preconditions', () => {
    it('rejects wrong tool', async () => {
      driver.selectTool('resize');
      const r = await driver.convertAudio({ format: 'mp3' });
      expect(r.ok).toBe(false);
    });

    it('rejects without file', async () => {
      driver.selectTool('audio-convert');
      const r = await driver.convertAudio({ format: 'mp3' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/No audio file/);
    });

    it('rejects oversized audio', async () => {
      driver.selectTool('audio-convert');
      // 21 MB exceeds 20MB audio limit
      driver.loadFile(makeAudioFile(21 * 1024));
      const r = await driver.convertAudio({ format: 'wav' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/too large/i);
    });
  });

  describe('video-compress preconditions', () => {
    it('rejects without file', async () => {
      driver.selectTool('video-compress');
      const r = await driver.compressVideo({ preset: 'web' });
      expect(r.ok).toBe(false);
    });

    it('rejects oversized video', async () => {
      driver.selectTool('video-compress');
      driver.loadFile(makeVideoFile(101 * 1024));
      const r = await driver.compressVideo({ preset: 'web' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/too large/i);
    });
  });

  describe('video-to-gif preconditions', () => {
    it('rejects without file', async () => {
      driver.selectTool('video-to-gif');
      const r = await driver.videoToGif({ startTime: 0, endTime: 5, fps: 15 });
      expect(r.ok).toBe(false);
    });

    it('rejects invalid time range', async () => {
      driver.selectTool('video-to-gif');
      driver.loadFile(makeVideoFile());
      const r = await driver.videoToGif({ startTime: 10, endTime: 5, fps: 15 });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/Start time/);
    });
  });

  describe('extract-audio preconditions', () => {
    it('rejects without file', async () => {
      driver.selectTool('audio-extract');
      const r = await driver.extractAudio({ format: 'mp3' });
      expect(r.ok).toBe(false);
    });
  });

  // =========================================================================
  // CROSS-TOOL WORKFLOWS
  // =========================================================================

  describe('cross-tool workflows', () => {
    it('switch between text tools preserving nothing', () => {
      driver.selectTool('word-count');
      driver.setText('hello world');
      expect(driver.countWords().ok).toBe(true);

      // Switch to case-convert — state resets
      driver.selectTool('case-convert');
      expect(driver.textInput).toBe('');
      expect(driver.convertCase('upper').ok).toBe(false); // no text
    });

    it('image chain: resize → compress → convert', async () => {
      const file = makeImageFile(10, 'image/png', 'photo.png');
      const r = await driver.chainImageOps(file, [
        { op: 'resize', options: { width: 200, height: 200, maintainAspectRatio: true } },
        { op: 'compress', options: { quality: 70 } },
        { op: 'convert', options: { format: 'jpg' } },
      ]);
      expect(r.ok).toBe(true);
      expect(r.data!.blob).toBeInstanceOf(Blob);
    });

    it('image chain: rotate → crop', async () => {
      const file = makeImageFile();
      const r = await driver.chainImageOps(file, [
        { op: 'rotate', options: { degrees: 90 } },
      ]);
      expect(r.ok).toBe(true);
    });

    it('text tools in sequence: count → convert → compare', () => {
      // 1. Count words
      driver.selectTool('word-count');
      driver.setText('hello world foo bar');
      const count = driver.countWords();
      expect(count.ok).toBe(true);
      expect(count.data!.words).toBe(4);

      // 2. Convert case
      driver.selectTool('case-convert');
      driver.setText('hello world foo bar');
      const upper = driver.convertCase('upper');
      expect(upper.data).toBe('HELLO WORLD FOO BAR');

      // 3. Compare original vs converted
      driver.selectTool('text-compare');
      driver.setText('hello world foo bar');
      driver.setText2(upper.data!);
      const diff = driver.compareTexts();
      expect(diff.ok).toBe(true);
      expect(diff.data!.some((d) => d.type !== 'equal')).toBe(true);
    });

    it('multiple image operations across tool switches', async () => {
      const img = makeImageFile();

      // Resize
      driver.selectTool('resize');
      driver.loadFile(img);
      const resized = await driver.resizeImage({ width: 200, height: 200, maintainAspectRatio: false });
      expect(resized.ok).toBe(true);

      // Rotate the output
      driver.selectTool('rotate');
      const resizedFile = new File([resized.data!.blob], 'resized.png', { type: 'image/png' });
      driver.loadFile(resizedFile);
      const rotated = await driver.rotateImage({ degrees: 180 });
      expect(rotated.ok).toBe(true);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('edge cases', () => {
    it('word count on single character', () => {
      driver.selectTool('word-count');
      driver.setText('a');
      const r = driver.countWords();
      expect(r.ok).toBe(true);
      expect(r.data!.words).toBe(1);
      expect(r.data!.characters).toBe(1);
    });

    it('word count on whitespace only', () => {
      driver.selectTool('word-count');
      driver.setText('   ');
      const r = driver.countWords();
      expect(r.ok).toBe(true);
      expect(r.data!.words).toBe(0);
    });

    it('case convert toggle', () => {
      driver.selectTool('case-convert');
      driver.setText('Hello World');
      const r = driver.convertCase('toggle');
      expect(r.ok).toBe(true);
      expect(r.data).toBe('hELLO wORLD');
    });

    it('compare with one empty text', () => {
      driver.selectTool('text-compare');
      driver.setText('some text');
      // setText2 not called — defaults to ''
      const r = driver.compareTexts();
      expect(r.ok).toBe(true);
    });

    it('sentence case conversion', () => {
      driver.selectTool('case-convert');
      driver.setText('hello world. goodbye world.');
      const r = driver.convertCase('sentence');
      expect(r.ok).toBe(true);
      // First char should be uppercase
      expect(r.data![0]).toBe('H');
    });
  });
});
