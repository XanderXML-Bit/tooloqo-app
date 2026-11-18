import { describe, it, expect } from 'vitest';
import {
  isValidHexColor,
  isValidCssColor,
  validateNumber,
  validateText,
  isValidUrl,
  isValidEmail,
  validateBeforeProcess,
  validateBatchBeforeProcess,
  validateAudioFile,
  validateVideoFile,
  FILE_SIZE_LIMITS,
} from '@/utils/validation';

describe('validation utilities', () => {
  describe('isValidHexColor', () => {
    it('should validate 6-digit hex colors', () => {
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#3b82f6')).toBe(true);
    });

    it('should validate 3-digit hex colors', () => {
      expect(isValidHexColor('#000')).toBe(true);
      expect(isValidHexColor('#FFF')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('000000')).toBe(false);
      expect(isValidHexColor('#GGGGGG')).toBe(false);
      expect(isValidHexColor('#12345')).toBe(false);
    });
  });

  describe('isValidCssColor', () => {
    it('should validate hex colors', () => {
      expect(isValidCssColor('#3b82f6')).toBe(true);
    });

    it('should validate rgb colors', () => {
      expect(isValidCssColor('rgb(255, 255, 255)')).toBe(true);
    });

    it('should validate color names', () => {
      expect(isValidCssColor('red')).toBe(true);
      expect(isValidCssColor('blue')).toBe(true);
    });
  });

  describe('validateNumber', () => {
    it('should validate numbers within range', () => {
      expect(validateNumber(50, 0, 100).valid).toBe(true);
    });

    it('should reject numbers below min', () => {
      const result = validateNumber(-1, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('should reject numbers above max', () => {
      const result = validateNumber(101, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at most');
    });

    it('should reject NaN', () => {
      const result = validateNumber(NaN, 0, 100);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateText', () => {
    it('should validate text within length constraints', () => {
      expect(validateText('hello', { minLength: 1, maxLength: 10 }).valid).toBe(true);
    });

    it('should reject text below minLength', () => {
      const result = validateText('hi', { minLength: 5 });
      expect(result.valid).toBe(false);
    });

    it('should reject text above maxLength', () => {
      const result = validateText('hello world', { maxLength: 5 });
      expect(result.valid).toBe(false);
    });

    it('should handle required validation', () => {
      const result = validateText('', { required: true });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('isValidUrl', () => {
    it('should validate valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not an email')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });
  });

  describe('FILE_SIZE_LIMITS', () => {
    it('should have correct limits', () => {
      expect(FILE_SIZE_LIMITS.image).toBe(10 * 1024 * 1024);
      expect(FILE_SIZE_LIMITS.pdf).toBe(50 * 1024 * 1024);
      expect(FILE_SIZE_LIMITS.audio).toBe(20 * 1024 * 1024);
      expect(FILE_SIZE_LIMITS.video).toBe(100 * 1024 * 1024);
    });
  });

  describe('validateBeforeProcess', () => {
    it('should accept files within size limit', () => {
      const blob = new Blob([new Uint8Array(5 * 1024 * 1024)]);
      const result = validateBeforeProcess(blob, 'image');
      expect(result.valid).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      const blob = new Blob([new Uint8Array(15 * 1024 * 1024)]);
      const result = validateBeforeProcess(blob, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should use custom maxSizeMB when provided', () => {
      const blob = new Blob([new Uint8Array(3 * 1024 * 1024)]);
      const result = validateBeforeProcess(blob, 'image', { maxSizeMB: 2 });
      expect(result.valid).toBe(false);
    });

    it('should validate file type when allowedTypes provided', () => {
      const file = new File([new Uint8Array(100)], 'test.txt', { type: 'text/plain' });
      const result = validateBeforeProcess(file, 'image', {
        allowedTypes: ['image/png', 'image/jpeg'],
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should accept valid file type', () => {
      const file = new File([new Uint8Array(100)], 'test.png', { type: 'image/png' });
      const result = validateBeforeProcess(file, 'image', {
        allowedTypes: ['image/png', 'image/jpeg'],
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateBatchBeforeProcess', () => {
    it('should accept valid batch', () => {
      const files = [
        new Blob([new Uint8Array(1024)]),
        new Blob([new Uint8Array(1024)]),
      ];
      const result = validateBatchBeforeProcess(files, 'image');
      expect(result.valid).toBe(true);
    });

    it('should reject when exceeding maxFiles', () => {
      const files = [
        new Blob([new Uint8Array(100)]),
        new Blob([new Uint8Array(100)]),
        new Blob([new Uint8Array(100)]),
      ];
      const result = validateBatchBeforeProcess(files, 'image', { maxFiles: 2 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Too many files');
    });

    it('should reject when exceeding maxTotalSizeMB', () => {
      const files = [
        new Blob([new Uint8Array(3 * 1024 * 1024)]),
        new Blob([new Uint8Array(3 * 1024 * 1024)]),
      ];
      const result = validateBatchBeforeProcess(files, 'image', { maxTotalSizeMB: 5 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Total size too large');
    });

    it('should indicate which file failed validation', () => {
      const files = [
        new Blob([new Uint8Array(1024)]),
        new Blob([new Uint8Array(15 * 1024 * 1024)]), // Too large
      ];
      const result = validateBatchBeforeProcess(files, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File 2');
    });
  });

  describe('validateAudioFile', () => {
    it('should accept valid audio files', () => {
      const file = new File([new Uint8Array(1024)], 'test.mp3', { type: 'audio/mpeg' });
      const result = validateAudioFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid audio types', () => {
      const file = new File([new Uint8Array(1024)], 'test.txt', { type: 'text/plain' });
      const result = validateAudioFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should reject files exceeding size limit', () => {
      const file = new File([new Uint8Array(25 * 1024 * 1024)], 'test.mp3', { type: 'audio/mpeg' });
      const result = validateAudioFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than 20MB');
    });

    it('should respect custom maxSizeMB', () => {
      const file = new File([new Uint8Array(6 * 1024 * 1024)], 'test.mp3', { type: 'audio/mpeg' });
      const result = validateAudioFile(file, { maxSizeMB: 5 });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateVideoFile', () => {
    it('should accept valid video files', () => {
      const file = new File([new Uint8Array(1024)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept webm videos', () => {
      const file = new File([new Uint8Array(1024)], 'test.webm', { type: 'video/webm' });
      const result = validateVideoFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid video types', () => {
      const file = new File([new Uint8Array(1024)], 'test.txt', { type: 'text/plain' });
      const result = validateVideoFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should reject files exceeding size limit', () => {
      const file = new File([new Uint8Array(150 * 1024 * 1024)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than 100MB');
    });

    it('should respect custom maxSizeMB', () => {
      const file = new File([new Uint8Array(60 * 1024 * 1024)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoFile(file, { maxSizeMB: 50 });
      expect(result.valid).toBe(false);
    });
  });
});

describe('file validation boundaries', () => {
  it.each(['image', 'pdf', 'audio', 'video'] as const)('accepts the exact %s limit and rejects one byte over it', category => {
    // Structural input avoids allocating up to 100 MB for a size-only check.
    const exact = { size: FILE_SIZE_LIMITS[category], type: '' } as Blob;
    expect(validateBeforeProcess(exact, category)).toEqual({ valid: true });
    expect(validateBeforeProcess({ ...exact, size: exact.size + 1 } as Blob, category).valid).toBe(false);
  });

  it('accepts a batch at both the count and total-size boundaries', () => {
    const files = [{ size: 512 * 1024, type: 'image/png' }, { size: 512 * 1024, type: 'image/png' }] as Blob[];
    expect(validateBatchBeforeProcess(files, 'image', { maxFiles: 2, maxTotalSizeMB: 1 })).toEqual({ valid: true });
    files[1] = { ...files[1], size: files[1].size + 1 } as Blob;
    expect(validateBatchBeforeProcess(files, 'image', { maxFiles: 2, maxTotalSizeMB: 1 }).error).toContain('Total size too large');
  });

  it('reports the invalid MIME type and its position in a batch', () => {
    const files = [new Blob(['png'], { type: 'image/png' }), new Blob(['text'], { type: 'text/plain' })];
    expect(validateBatchBeforeProcess(files, 'image', { allowedTypes: ['image/png'] })).toEqual({
      valid: false,
      error: 'File 2: Invalid file type: text/plain. Allowed: image/png',
    });
  });
});
