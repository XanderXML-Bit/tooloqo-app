import imageCompression from 'browser-image-compression';
// The compression worker loads this script with importScripts. Without libURL the library fetches it
// from cdn.jsdelivr.net, so bundle it as a same-origin asset (also precached for offline use).
import compressionLibUrl from 'browser-image-compression/dist/browser-image-compression.js?url';
import type {
  ImageResizeOptions,
  ImageCompressOptions,
  ImageConvertOptions,
  ImageRotateOptions,
} from '@/types';
import { validateBeforeProcess, FILE_SIZE_LIMITS } from '@/utils/validation';

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class FileTooLargeError extends ImageProcessingError {
  constructor(maxSize: number) {
    super(`File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
    this.name = 'FileTooLargeError';
  }
}

export class UnsupportedFormatError extends ImageProcessingError {
  constructor(format: string) {
    super(`Unsupported image format: ${format}`);
    this.name = 'UnsupportedFormatError';
  }
}

/** Supported image MIME types */
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

/**
 * Validate an image file before processing.
 * Checks for empty files, size limits, and supported formats.
 *
 * @throws {ImageProcessingError} If the file fails validation
 */
function validateImageFile(blob: Blob): void {
  if (blob.size === 0) {
    throw new ImageProcessingError('Cannot process empty file');
  }
  const result = validateBeforeProcess(blob, 'image', {
    maxSizeMB: FILE_SIZE_LIMITS.image / (1024 * 1024),
    allowedTypes: SUPPORTED_IMAGE_TYPES,
  });
  if (!result.valid) {
    throw new ImageProcessingError(result.error || 'File validation failed');
  }
}

/** Maximum canvas dimension to prevent browser memory issues */
export const MAX_CANVAS_DIMENSION = 4096;

/** Default JPEG output quality (0-1) */
const DEFAULT_JPEG_QUALITY = 0.92;

/** Thumbnail JPEG quality (0-1) */
const THUMBNAIL_QUALITY = 0.7;

function clampDimensions(
  width: number,
  height: number,
  maxDimension = MAX_CANVAS_DIMENSION
): { width: number; height: number; clamped: boolean } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height, clamped: false };
  }
  const scale = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    clamped: true,
  };
}

async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new ImageProcessingError('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new ImageProcessingError('Failed to load image'));
    };
    img.src = URL.createObjectURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new ImageProcessingError('Failed to convert canvas to blob'));
        }
      },
      type,
      quality
    );
  });
}

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new ImageProcessingError('Failed to load image'));
    };
    img.src = URL.createObjectURL(blob);
  });
}

export const imageService = {
  /**
   * Get the dimensions of an image
   */
  getDimensions: getImageDimensions,

  /**
   * Resize an image to specified dimensions
   */
  resize: async (blob: Blob, options: ImageResizeOptions): Promise<Blob> => {
    const { width, height, maintainAspectRatio } = options;

    // Validate file size and type before processing
    validateImageFile(blob);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new ImageProcessingError('Width and height must be positive finite numbers');
    }

    const canvas = await blobToCanvas(blob);
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    let targetWidth = width;
    let targetHeight = height;

    if (maintainAspectRatio) {
      const aspectRatio = originalWidth / originalHeight;
      if (width / height > aspectRatio) {
        targetWidth = Math.round(height * aspectRatio);
      } else {
        targetHeight = Math.round(width / aspectRatio);
      }
    }

    // Clamp to max safe canvas dimensions
    const clamped = clampDimensions(targetWidth, targetHeight);
    targetWidth = clamped.width;
    targetHeight = clamped.height;

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;

    const ctx = resizedCanvas.getContext('2d');
    if (!ctx) {
      throw new ImageProcessingError('Failed to get canvas context');
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    // Determine output type based on input
    const type = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return canvasToBlob(resizedCanvas, type, DEFAULT_JPEG_QUALITY);
  },

  /**
   * Compress an image to reduce file size
   */
  compress: async (blob: Blob, options: ImageCompressOptions): Promise<Blob> => {
    // Validate file size and type before processing
    validateImageFile(blob);

    const { quality, maxSizeKB } = options;

    const compressionOptions = {
      maxSizeMB: maxSizeKB ? maxSizeKB / 1024 : undefined,
      initialQuality: quality / 100,
      useWebWorker: true,
      // The worker is created from a blob: URL, so the script URL must be absolute.
      libURL: new URL(compressionLibUrl, window.location.href).href,
      preserveExif: true,
    };

    try {
      const file = new File([blob], 'image', { type: blob.type });
      const compressedFile = await imageCompression(file, compressionOptions);
      return compressedFile;
    } catch (error) {
      throw new ImageProcessingError(
        `Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Convert image to a different format
   */
  convert: async (blob: Blob, options: ImageConvertOptions): Promise<Blob> => {
    // Validate file size and type before processing
    validateImageFile(blob);

    const { format, quality = 92 } = options;

    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      webp: 'image/webp',
    };

    const targetType = mimeTypes[format];
    if (!targetType) {
      throw new UnsupportedFormatError(format);
    }

    const canvas = await blobToCanvas(blob);

    // For PNG, don't use quality parameter
    if (format === 'png') {
      return canvasToBlob(canvas, targetType);
    }

    return canvasToBlob(canvas, targetType, quality / 100);
  },

  /**
   * Rotate and/or flip an image
   */
  rotate: async (blob: Blob, options: ImageRotateOptions): Promise<Blob> => {
    // Validate file size and type before processing
    validateImageFile(blob);

    const { degrees, flipHorizontal = false, flipVertical = false } = options;

    const canvas = await blobToCanvas(blob);
    const { width, height } = canvas;

    // Calculate new dimensions for rotated canvas
    const isRotated90or270 = degrees === 90 || degrees === 270;
    const newWidth = isRotated90or270 ? height : width;
    const newHeight = isRotated90or270 ? width : height;

    const rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = newWidth;
    rotatedCanvas.height = newHeight;

    const ctx = rotatedCanvas.getContext('2d');
    if (!ctx) {
      throw new ImageProcessingError('Failed to get canvas context');
    }

    // Move to center
    ctx.translate(newWidth / 2, newHeight / 2);

    // Apply rotation
    ctx.rotate((degrees * Math.PI) / 180);

    // Apply flips
    const scaleX = flipHorizontal ? -1 : 1;
    const scaleY = flipVertical ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // Draw image centered
    ctx.drawImage(canvas, -width / 2, -height / 2);

    const type = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return canvasToBlob(rotatedCanvas, type, DEFAULT_JPEG_QUALITY);
  },

  /**
   * Crop an image to specified coordinates
   */
  crop: async (
    blob: Blob,
    cropArea: { x: number; y: number; width: number; height: number }
  ): Promise<Blob> => {
    const { x, y, width, height } = cropArea;

    // Validate file size and type before processing
    validateImageFile(blob);

    if (width <= 0 || height <= 0) {
      throw new ImageProcessingError('Crop dimensions must be positive');
    }

    if (x < 0 || y < 0) {
      throw new ImageProcessingError('Crop position must not be negative');
    }

    const canvas = await blobToCanvas(blob);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) {
      throw new ImageProcessingError('Failed to get canvas context');
    }

    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    const type = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return canvasToBlob(croppedCanvas, type, DEFAULT_JPEG_QUALITY);
  },

  /**
   * Generate a thumbnail for preview
   */
  generateThumbnail: async (blob: Blob, maxSize: number = 200): Promise<string> => {
    // Validate file size and type before processing
    validateImageFile(blob);

    const canvas = await blobToCanvas(blob);
    const { width, height } = canvas;

    let targetWidth = width;
    let targetHeight = height;

    if (width > height && width > maxSize) {
      targetWidth = maxSize;
      targetHeight = Math.round((height * maxSize) / width);
    } else if (height > maxSize) {
      targetHeight = maxSize;
      targetWidth = Math.round((width * maxSize) / height);
    }

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = targetWidth;
    thumbCanvas.height = targetHeight;

    const ctx = thumbCanvas.getContext('2d');
    if (!ctx) {
      throw new ImageProcessingError('Failed to get canvas context');
    }

    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    return thumbCanvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
  },
};
