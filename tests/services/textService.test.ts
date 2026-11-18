import { describe, it, expect } from 'vitest';
import { textService } from '../../src/services/textService';

describe('textService', () => {
  describe('wordCount', () => {
    it('returns zeros for empty string', () => {
      const result = textService.wordCount('');
      expect(result.characters).toBe(0);
      expect(result.words).toBe(0);
      expect(result.sentences).toBe(0);
      expect(result.paragraphs).toBe(0);
    });

    it('returns zeros for whitespace-only string', () => {
      const result = textService.wordCount('   \n\n  ');
      expect(result.words).toBe(0);
    });

    it('counts single word', () => {
      const result = textService.wordCount('Hello');
      expect(result.words).toBe(1);
      expect(result.characters).toBe(5);
      expect(result.charactersNoSpaces).toBe(5);
    });

    it('counts multiple words correctly', () => {
      const result = textService.wordCount('The quick brown fox jumps');
      expect(result.words).toBe(5);
    });

    it('counts sentences with different terminators', () => {
      const result = textService.wordCount('Hello. How are you? Great!');
      expect(result.sentences).toBe(3);
    });

    it('counts paragraphs separated by blank lines', () => {
      const result = textService.wordCount('First paragraph.\n\nSecond paragraph.\n\nThird.');
      expect(result.paragraphs).toBe(3);
    });

    it('calculates reading time', () => {
      // 200 words should take 1 minute
      const words = Array(200).fill('word').join(' ');
      const result = textService.wordCount(words);
      expect(result.readingTimeMinutes).toBe(1);
    });

    it('calculates speaking time', () => {
      // 130 words should take 1 minute
      const words = Array(130).fill('word').join(' ');
      const result = textService.wordCount(words);
      expect(result.speakingTimeMinutes).toBe(1);
    });

    it('handles unicode text', () => {
      const result = textService.wordCount('こんにちは 世界');
      expect(result.words).toBe(2);
    });

    it('handles text with multiple spaces between words', () => {
      const result = textService.wordCount('word1   word2    word3');
      expect(result.words).toBe(3);
    });

    it('counts characters including spaces', () => {
      const result = textService.wordCount('a b');
      expect(result.characters).toBe(3);
      expect(result.charactersNoSpaces).toBe(2);
    });
  });

  describe('convertCase', () => {
    it('converts to uppercase', () => {
      expect(textService.convertCase('hello world', 'upper')).toBe('HELLO WORLD');
    });

    it('converts to lowercase', () => {
      expect(textService.convertCase('HELLO WORLD', 'lower')).toBe('hello world');
    });

    it('converts to title case', () => {
      expect(textService.convertCase('hello world', 'title')).toBe('Hello World');
    });

    it('converts to sentence case', () => {
      const result = textService.convertCase('hello world. goodbye world', 'sentence');
      expect(result).toContain('Hello');
      expect(result).toContain('Goodbye');
    });

    it('toggles case', () => {
      expect(textService.convertCase('Hello', 'toggle')).toBe('hELLO');
    });

    it('handles empty string', () => {
      expect(textService.convertCase('', 'upper')).toBe('');
    });

    it('returns original for unknown case type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(textService.convertCase('test', 'unknown' as any)).toBe('test');
    });
  });

  describe('convertCase edge cases', () => {
    it('handles special characters in title case', () => {
      expect(textService.convertCase('hello-world foo_bar', 'title')).toContain('Hello');
    });

    it('handles single character', () => {
      expect(textService.convertCase('a', 'upper')).toBe('A');
      expect(textService.convertCase('A', 'lower')).toBe('a');
      expect(textService.convertCase('a', 'title')).toBe('A');
      expect(textService.convertCase('a', 'toggle')).toBe('A');
    });

    it('handles numbers and symbols', () => {
      expect(textService.convertCase('123!@#', 'upper')).toBe('123!@#');
      expect(textService.convertCase('123!@#', 'toggle')).toBe('123!@#');
    });

    it('handles emoji text', () => {
      const result = textService.convertCase('hello 👋 world', 'upper');
      expect(result).toContain('HELLO');
      expect(result).toContain('WORLD');
    });
  });

  describe('wordCount edge cases', () => {
    it('handles single sentence without terminator', () => {
      const result = textService.wordCount('Hello world');
      expect(result.sentences).toBe(1);
    });

    it('handles consecutive sentence terminators', () => {
      const result = textService.wordCount('Really?! Yes...');
      expect(result.sentences).toBe(2);
    });

    it('handles very long single word', () => {
      const longWord = 'a'.repeat(10000);
      const result = textService.wordCount(longWord);
      expect(result.words).toBe(1);
      expect(result.characters).toBe(10000);
    });

    it('single paragraph with no blank lines', () => {
      const result = textService.wordCount('line1\nline2\nline3');
      expect(result.paragraphs).toBe(1);
    });
  });

  describe('compareTexts', () => {
    it('returns equal for identical texts', () => {
      const result = textService.compareTexts('line1\nline2', 'line1\nline2');
      expect(result.every(r => r.type === 'equal')).toBe(true);
    });

    it('detects added lines', () => {
      const result = textService.compareTexts('line1', 'line1\nline2');
      const adds = result.filter(r => r.type === 'add');
      expect(adds.length).toBeGreaterThan(0);
    });

    it('detects removed lines', () => {
      const result = textService.compareTexts('line1\nline2', 'line1');
      const removes = result.filter(r => r.type === 'remove');
      expect(removes.length).toBeGreaterThan(0);
    });

    it('handles empty texts', () => {
      const result = textService.compareTexts('', '');
      expect(result).toEqual([{ type: 'equal', value: '' }]);
    });

    it('handles completely different texts', () => {
      const result = textService.compareTexts('aaa', 'bbb');
      const hasChanges = result.some(r => r.type === 'add' || r.type === 'remove');
      expect(hasChanges).toBe(true);
    });

    it('handles one empty text vs non-empty', () => {
      const result = textService.compareTexts('', 'hello');
      expect(result.some(r => r.type === 'add')).toBe(true);
    });

    it('handles non-empty vs empty text', () => {
      const result = textService.compareTexts('hello', '');
      expect(result.some(r => r.type === 'remove')).toBe(true);
    });

    it('handles multi-line with insertions in middle', () => {
      const result = textService.compareTexts('a\nc', 'a\nb\nc');
      const adds = result.filter(r => r.type === 'add');
      expect(adds.length).toBeGreaterThan(0);
    });
  });
});

// Exact diff output and reconstruction catch dropped, reordered, or duplicated lines.
describe('text utility boundaries', () => {
  it.each([
    ['a\nc', 'a\nb\nc', [{ type: 'equal', value: 'a' }, { type: 'add', value: 'b' }, { type: 'equal', value: 'c' }]],
    ['a\nb\nc', 'a\nc', [{ type: 'equal', value: 'a' }, { type: 'remove', value: 'b' }, { type: 'equal', value: 'c' }]],
    ['old', 'new', [{ type: 'remove', value: 'old' }, { type: 'add', value: 'new' }]],
  ])('produces an exact diff for %s -> %s', (before, after, expected) => {
    expect(textService.compareTexts(before, after)).toEqual(expected);
  });

  it('reconstructs both texts when lines repeat and the final line is empty', () => {
    const before = 'a\nb\na\n';
    const after = 'b\na\nb\n';
    const diff = textService.compareTexts(before, after);
    expect(diff.filter(line => line.type !== 'add').map(line => line.value).join('\n')).toBe(before);
    expect(diff.filter(line => line.type !== 'remove').map(line => line.value).join('\n')).toBe(after);
  });

  it.each([true, false])('uses the bounded fallback when the first input is large: %s', largeFirst => {
    const large = Array(10001).fill('same').join('\n');
    const small = 'changed';
    const diff = textService.compareTexts(largeFirst ? large : small, largeFirst ? small : large);
    expect(diff.slice(0, 2)).toEqual([
      { type: 'remove', value: largeFirst ? 'same' : 'changed' },
      { type: 'add', value: largeFirst ? 'changed' : 'same' },
    ]);
    expect(diff).toHaveLength(10001);
    expect(diff.slice(2).every(line => line.type === (largeFirst ? 'remove' : 'add') && line.value === 'same')).toBe(true);
  });

  it.each([130, 131, 200, 201])('rounds reading and speaking estimates at %i words', count => {
    const result = textService.wordCount(Array(count).fill('word').join(' '));
    expect(result.readingTimeMinutes).toBe(count <= 200 ? 1 : 2);
    expect(result.speakingTimeMinutes).toBe(count <= 130 ? 1 : 2);
  });
});
