import { describe, it, expect } from 'vitest';
import { imageService, ImageProcessingError, FileTooLargeError, UnsupportedFormatError, MAX_CANVAS_DIMENSION } from '../../src/services/imageService';

describe('imageService edge cases', () => {
  const emptyBlob = new Blob([], { type: 'image/png' });

  describe('resize', () => {
    it('rejects empty blob', async () => {
      await expect(
        imageService.resize(emptyBlob, { width: 100, height: 100, maintainAspectRatio: false })
      ).rejects.toThrow('Cannot process empty file');
    });

    it('rejects zero width', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        imageService.resize(blob, { width: 0, height: 100, maintainAspectRatio: false })
      ).rejects.toThrow('Width and height must be positive finite numbers');
    });

    it('rejects negative dimensions', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        imageService.resize(blob, { width: -10, height: 100, maintainAspectRatio: false })
      ).rejects.toThrow('Width and height must be positive finite numbers');
    });

    it('rejects NaN dimensions', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        imageService.resize(blob, { width: NaN, height: 100, maintainAspectRatio: false })
      ).rejects.toThrow('Width and height must be positive finite numbers');
    });

    it('rejects Infinity dimensions', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        imageService.resize(blob, { width: Infinity, height: 100, maintainAspectRatio: false })
      ).rejects.toThrow('Width and height must be positive finite numbers');
    });
  });

  describe('compress', () => {
    it('rejects empty blob', async () => {
      await expect(
        imageService.compress(emptyBlob, { quality: 80 })
      ).rejects.toThrow('Cannot process empty file');
    });
  });

  describe('convert', () => {
    it('rejects empty blob', async () => {
      await expect(
        imageService.convert(emptyBlob, { format: 'png' })
      ).rejects.toThrow('Cannot process empty file');
    });

    it('rejects unsupported format', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        imageService.convert(blob, { format: 'bmp' as any })
      ).rejects.toThrow(UnsupportedFormatError);
    });
  });

  describe('rotate', () => {
    it('rejects empty blob', async () => {
      await expect(
        imageService.rotate(emptyBlob, { degrees: 90 })
      ).rejects.toThrow('Cannot process empty file');
    });
  });

  describe('crop', () => {
    it('rejects empty blob', async () => {
      await expect(
        imageService.crop(emptyBlob, { x: 0, y: 0, width: 50, height: 50 })
      ).rejects.toThrow('Cannot process empty file');
    });

    it('rejects zero crop dimensions', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        imageService.crop(blob, { x: 0, y: 0, width: 0, height: 50 })
      ).rejects.toThrow('Crop dimensions must be positive');
    });

    it('rejects negative crop position', async () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      await expect(
        imageService.crop(blob, { x: -10, y: 0, width: 50, height: 50 })
      ).rejects.toThrow('Crop position must not be negative');
    });
  });

  describe('generateThumbnail', () => {
    it('rejects empty blob', async () => {
      await expect(
        imageService.generateThumbnail(emptyBlob)
      ).rejects.toThrow('Cannot process empty file');
    });
  });
});

describe('imageService error classes', () => {
  describe('ImageProcessingError', () => {
    it('has correct name and message', () => {
      const err = new ImageProcessingError('something failed');
      expect(err.name).toBe('ImageProcessingError');
      expect(err.message).toBe('something failed');
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('FileTooLargeError', () => {
    it('formats size in MB', () => {
      const err = new FileTooLargeError(10 * 1024 * 1024);
      expect(err.name).toBe('FileTooLargeError');
      expect(err.message).toContain('10MB');
      expect(err instanceof ImageProcessingError).toBe(true);
    });

    it('rounds fractional sizes', () => {
      const err = new FileTooLargeError(5.5 * 1024 * 1024);
      expect(err.message).toContain('6MB');
    });
  });

  describe('UnsupportedFormatError', () => {
    it('includes format in message', () => {
      const err = new UnsupportedFormatError('bmp');
      expect(err.name).toBe('UnsupportedFormatError');
      expect(err.message).toContain('bmp');
      expect(err instanceof ImageProcessingError).toBe(true);
    });
  });

  describe('MAX_CANVAS_DIMENSION', () => {
    it('is a reasonable limit', () => {
      expect(MAX_CANVAS_DIMENSION).toBeGreaterThan(0);
      expect(MAX_CANVAS_DIMENSION).toBeLessThanOrEqual(16384);
    });
  });
});
