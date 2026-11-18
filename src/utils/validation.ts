/**
 * Validation utilities
 * Following the lumoqo pattern for type-safe validation
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a value is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Validate that a value is a valid CSS color
 */
export function isValidCssColor(color: string): boolean {
  if (isValidHexColor(color)) return true;
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) return true;
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) return true;
  if (/^hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)$/.test(color)) return true;
  // Common color names
  const colorNames = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'orange', 'purple', 'pink'];
  return colorNames.includes(color.toLowerCase());
}

/**
 * Validate a number within a range
 */
export function validateNumber(
  value: number,
  min: number,
  max: number,
  fieldName = 'Value'
): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }
  return { valid: true };
}

/**
 * Validate text with length constraints
 */
export function validateText(
  value: string,
  options: { minLength?: number; maxLength?: number; required?: boolean; fieldName?: string } = {}
): ValidationResult {
  const { minLength = 0, maxLength = Infinity, required = false, fieldName = 'Text' } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate an image file
 */
export function validateImageFile(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): ValidationResult {
  const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } = options;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not supported` };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Validate a PDF file
 */
export function validatePdfFile(
  file: File,
  options: { maxSizeMB?: number } = {}
): ValidationResult {
  const { maxSizeMB = 50 } = options;

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Validate a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Platform detection utilities
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

// Preset validators
export const IMAGE_SIZE_VALIDATION = { maxSizeMB: 10 };
export const PDF_SIZE_VALIDATION = { maxSizeMB: 50 };
export const TEXT_LENGTH_VALIDATION = { minLength: 1, maxLength: 10000 };

/**
 * File size limits by category (in bytes)
 * Used for pre-processing validation to prevent memory issues
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,      // 10 MB
  pdf: 50 * 1024 * 1024,        // 50 MB
  audio: 20 * 1024 * 1024,      // 20 MB
  video: 100 * 1024 * 1024,     // 100 MB
} as const;

export type FileCategory = keyof typeof FILE_SIZE_LIMITS;

/**
 * Validate a file/blob before processing
 * Call this in service methods before expensive operations
 */
export function validateBeforeProcess(
  file: File | Blob,
  category: FileCategory,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): ValidationResult {
  const maxSize = options?.maxSizeMB
    ? options.maxSizeMB * 1024 * 1024
    : FILE_SIZE_LIMITS[category];

  // Size validation
  if (file.size > maxSize) {
    const limitMB = Math.round(maxSize / (1024 * 1024));
    const actualMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${actualMB} MB). Maximum: ${limitMB} MB`,
    };
  }

  // Type validation (if specified and file has type info)
  if (options?.allowedTypes && file.type) {
    if (!options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Allowed: ${options.allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate multiple files before batch processing
 */
export function validateBatchBeforeProcess(
  files: (File | Blob)[],
  category: FileCategory,
  options?: {
    maxSizeMB?: number;
    maxTotalSizeMB?: number;
    maxFiles?: number;
    allowedTypes?: string[];
  }
): ValidationResult {
  // Check file count
  if (options?.maxFiles && files.length > options.maxFiles) {
    return {
      valid: false,
      error: `Too many files (${files.length}). Maximum: ${options.maxFiles}`,
    };
  }

  // Check total size
  if (options?.maxTotalSizeMB) {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const maxTotal = options.maxTotalSizeMB * 1024 * 1024;
    if (totalSize > maxTotal) {
      const actualMB = (totalSize / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Total size too large (${actualMB} MB). Maximum: ${options.maxTotalSizeMB} MB`,
      };
    }
  }

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const result = validateBeforeProcess(files[i], category, options);
    if (!result.valid) {
      return {
        valid: false,
        error: `File ${i + 1}: ${result.error}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate audio file
 */
export function validateAudioFile(
  file: File,
  options: { maxSizeMB?: number } = {}
): ValidationResult {
  const { maxSizeMB = 20 } = options;
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp4'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Audio type ${file.type} is not supported` };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Validate video file
 */
export function validateVideoFile(
  file: File,
  options: { maxSizeMB?: number } = {}
): ValidationResult {
  const { maxSizeMB = 100 } = options;
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Video type ${file.type} is not supported` };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}
