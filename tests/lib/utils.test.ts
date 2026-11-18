import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  cn,
  formatFileSize,
  formatDate,
  generateId,
} from '@/lib/utils';

describe('lib/utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      const isHidden = false;
      expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible');
    });

    it('deduplicates tailwind classes', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('formats with decimals', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('formatDate', () => {
    it('returns "just now" for recent dates', () => {
      expect(formatDate(new Date())).toBe('just now');
    });

    it('returns minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000);
      expect(formatDate(fiveMinAgo)).toBe('5 min ago');
    });

    it('returns hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
      expect(formatDate(twoHoursAgo)).toBe('2 hours ago');
    });

    it('returns days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      expect(formatDate(threeDaysAgo)).toBe('3 days ago');
    });
  });

  describe('generateId', () => {
    it('returns a UUID string', () => {
      const id = generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('generates unique ids', () => {
      const ids = new Set(Array.from({ length: 50 }, () => generateId()));
      expect(ids.size).toBe(50);
    });
  });
});

describe('formatting boundaries', () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    [59_999, 'just now'],
    [60_000, '1 min ago'],
    [3_600_000, '1 hour ago'],
    [86_400_000, '1 day ago'],
    [6 * 86_400_000, '6 days ago'],
  ])('formats elapsed time %i at the relative-date boundary', (elapsed, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
    expect(formatDate(new Date(Date.now() - elapsed))).toBe(expected);
  });

  it('switches to the local date after seven days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
    const oldDate = new Date(Date.now() - 7 * 86_400_000);
    expect(formatDate(oldDate)).toBe(oldDate.toLocaleDateString());
  });

  it.each([
    [1023, '1023 B'],
    [1024 ** 2 - 1, '1024 KB'],
    [1024 ** 3, '1 GB'],
    [1.25 * 1024 ** 3, '1.3 GB'],
  ])('formats %i bytes as %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });

  it('merges nested conditional classes while respecting responsive variants', () => {
    expect(cn(['p-4', { hidden: false, block: true }], 'md:p-8', 'p-2')).toBe('block md:p-8 p-2');
  });
});
