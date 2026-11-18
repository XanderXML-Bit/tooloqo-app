export interface WordCountResult {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'toggle';

export interface DiffResult {
  type: 'equal' | 'add' | 'remove';
  value: string;
}

export const textService = {
  /**
   * Count words, characters, sentences, etc.
   */
  wordCount: (text: string): WordCountResult => {
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Count words (split by whitespace)
    const words = trimmedText.split(/\s+/).filter((word) => word.length > 0).length;

    // Count sentences (split by . ! ?)
    const sentences = trimmedText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;

    // Count paragraphs (split by double newlines or more)
    const paragraphs = trimmedText
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0).length || 1;

    // Average reading speed: 200 words per minute
    const readingTimeMinutes = Math.ceil(words / 200);

    // Average speaking speed: 130 words per minute
    const speakingTimeMinutes = Math.ceil(words / 130);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
    };
  },

  /**
   * Convert text case
   */
  convertCase: (text: string, caseType: CaseType): string => {
    switch (caseType) {
      case 'upper':
        return text.toUpperCase();

      case 'lower':
        return text.toLowerCase();

      case 'title':
        return text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );

      case 'sentence':
        return text
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

      case 'toggle':
        return text
          .split('')
          .map((char) =>
            char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
          )
          .join('');

      default:
        return text;
    }
  },

  /**
   * Compare two texts and return differences
   */
  compareTexts: (text1: string, text2: string): DiffResult[] => {
    // Guard against extremely large inputs that would exhaust memory
    const MAX_LINES = 10000;

    // Simple line-by-line diff
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    if (lines1.length > MAX_LINES || lines2.length > MAX_LINES) {
      // Fall back to simple line-by-line comparison without LCS
      return simpleDiff(lines1.slice(0, MAX_LINES), lines2.slice(0, MAX_LINES));
    }

    const results: DiffResult[] = [];

    // Use simple LCS-based diff for lines
    const lcs = longestCommonSubsequence(lines1, lines2);
    let i = 0;
    let j = 0;
    let lcsIndex = 0;

    while (i < lines1.length || j < lines2.length) {
      if (
        lcsIndex < lcs.length &&
        i < lines1.length &&
        lines1[i] === lcs[lcsIndex]
      ) {
        if (j < lines2.length && lines2[j] === lcs[lcsIndex]) {
          // Both match LCS - equal
          results.push({ type: 'equal', value: lines1[i] });
          i++;
          j++;
          lcsIndex++;
        } else if (j < lines2.length) {
          // Line added in text2
          results.push({ type: 'add', value: lines2[j] });
          j++;
        }
      } else if (i < lines1.length) {
        // Line removed from text1
        results.push({ type: 'remove', value: lines1[i] });
        i++;
      } else if (j < lines2.length) {
        // Line added in text2
        results.push({ type: 'add', value: lines2[j] });
        j++;
      }
    }

    return results;
  },
};

function longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;

  // Create DP table
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

/**
 * Simple line-by-line diff for large inputs where LCS would use too much memory.
 * Compares lines at matching indices rather than computing full LCS.
 */
function simpleDiff(lines1: string[], lines2: string[]): DiffResult[] {
  const results: DiffResult[] = [];
  const maxLen = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < lines1.length && i < lines2.length) {
      if (lines1[i] === lines2[i]) {
        results.push({ type: 'equal', value: lines1[i] });
      } else {
        results.push({ type: 'remove', value: lines1[i] });
        results.push({ type: 'add', value: lines2[i] });
      }
    } else if (i < lines1.length) {
      results.push({ type: 'remove', value: lines1[i] });
    } else {
      results.push({ type: 'add', value: lines2[i] });
    }
  }

  return results;
}
