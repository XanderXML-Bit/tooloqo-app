import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Vite emits the worker as a same-origin asset, so the PDF tools need no CDN.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { validateBeforeProcess, validateBatchBeforeProcess, FILE_SIZE_LIMITS } from '@/utils/validation';

// The worker comes from the same pdfjs-dist package, so its version always matches the API.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export class PdfProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfProcessingError';
  }
}

/** Supported image MIME types for PDF conversion */
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validate a PDF file before processing.
 * Checks for empty files, size limits (50MB), and PDF MIME type.
 *
 * @throws {PdfProcessingError} If the file fails validation
 */
function validatePdfFile(blob: Blob): void {
  if (blob.size === 0) {
    throw new PdfProcessingError('Cannot process empty file');
  }
  const result = validateBeforeProcess(blob, 'pdf', {
    maxSizeMB: FILE_SIZE_LIMITS.pdf / (1024 * 1024),
    allowedTypes: ['application/pdf'],
  });
  if (!result.valid) {
    throw new PdfProcessingError(result.error || 'File validation failed');
  }
}

/**
 * Validate multiple PDF files before processing.
 *
 * @throws {PdfProcessingError} If any file fails validation
 */
function validatePdfFiles(blobs: Blob[]): void {
  for (let i = 0; i < blobs.length; i++) {
    if (blobs[i].size === 0) {
      throw new PdfProcessingError(`File ${i + 1} is empty`);
    }
  }
  const result = validateBatchBeforeProcess(blobs, 'pdf', {
    maxSizeMB: FILE_SIZE_LIMITS.pdf / (1024 * 1024),
    allowedTypes: ['application/pdf'],
  });
  if (!result.valid) {
    throw new PdfProcessingError(result.error || 'Batch validation failed');
  }
}

/**
 * Validate image files for PDF conversion.
 *
 * @throws {PdfProcessingError} If any file fails validation
 */
function validateImageFilesForPdf(blobs: Blob[]): void {
  for (let i = 0; i < blobs.length; i++) {
    if (blobs[i].size === 0) {
      throw new PdfProcessingError(`Image ${i + 1} is empty`);
    }
  }
  const result = validateBatchBeforeProcess(blobs, 'image', {
    maxSizeMB: FILE_SIZE_LIMITS.image / (1024 * 1024),
    allowedTypes: SUPPORTED_IMAGE_TYPES,
  });
  if (!result.valid) {
    throw new PdfProcessingError(result.error || 'Image validation failed');
  }
}

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}

function uint8ArrayToBlob(data: Uint8Array, type = 'application/pdf'): Blob {
  // Create a new ArrayBuffer copy to satisfy TypeScript
  const buffer = new ArrayBuffer(data.length);
  new Uint8Array(buffer).set(data);
  return new Blob([buffer], { type });
}

export const pdfService = {
  /**
   * Get the number of pages in a PDF
   */
  getPageCount: async (blob: Blob): Promise<number> => {
    // Validate file size and type before processing
    validatePdfFile(blob);
    try {
      const arrayBuffer = await blobToArrayBuffer(blob);
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      throw new PdfProcessingError(
        `Failed to read PDF: ${error instanceof Error ? error.message : 'File may be corrupted or password-protected'}`
      );
    }
  },

  /**
   * Merge multiple PDFs into one
   */
  merge: async (blobs: Blob[]): Promise<Blob> => {
    if (blobs.length === 0) {
      throw new PdfProcessingError('No PDFs to merge');
    }

    // Validate all files for size and type before processing
    validatePdfFiles(blobs);

    if (blobs.length === 1) {
      return blobs[0];
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const blob of blobs) {
        const arrayBuffer = await blobToArrayBuffer(blob);
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      return uint8ArrayToBlob(mergedBytes);
    } catch (error) {
      if (error instanceof PdfProcessingError) throw error;
      throw new PdfProcessingError(
        `Failed to merge PDFs: ${error instanceof Error ? error.message : 'One or more files may be corrupted'}`
      );
    }
  },

  /**
   * Split a PDF - extract specific pages
   */
  split: async (blob: Blob, pageNumbers: number[]): Promise<Blob> => {
    // Validate file size and type before processing
    validatePdfFile(blob);
    if (pageNumbers.length === 0) {
      throw new PdfProcessingError('No pages selected');
    }

    try {
      const arrayBuffer = await blobToArrayBuffer(blob);
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const totalPages = sourcePdf.getPageCount();

      // Validate page numbers (convert to 0-indexed)
      const validPages = pageNumbers
        .map((p) => p - 1) // Convert to 0-indexed
        .filter((p) => p >= 0 && p < totalPages);

      if (validPages.length === 0) {
        throw new PdfProcessingError('No valid pages selected');
      }

      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, validPages);
      pages.forEach((page) => newPdf.addPage(page));

      const newBytes = await newPdf.save();
      return uint8ArrayToBlob(newBytes);
    } catch (error) {
      if (error instanceof PdfProcessingError) throw error;
      throw new PdfProcessingError(
        `Failed to split PDF: ${error instanceof Error ? error.message : 'File may be corrupted'}`
      );
    }
  },

  /**
   * Split a PDF into individual pages
   */
  splitAll: async (blob: Blob): Promise<Blob[]> => {
    // Validate file size and type before processing
    validatePdfFile(blob);
    try {
      const arrayBuffer = await blobToArrayBuffer(blob);
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const totalPages = sourcePdf.getPageCount();

      const results: Blob[] = [];

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(sourcePdf, [i]);
        newPdf.addPage(page);
        const bytes = await newPdf.save();
        results.push(uint8ArrayToBlob(bytes));
      }

      return results;
    } catch (error) {
      if (error instanceof PdfProcessingError) throw error;
      throw new PdfProcessingError(
        `Failed to split PDF: ${error instanceof Error ? error.message : 'File may be corrupted'}`
      );
    }
  },

  /**
   * Compress a PDF by reducing image quality
   * Note: Basic compression - removes metadata and optimizes structure
   */
  compress: async (blob: Blob): Promise<Blob> => {
    // Validate file size and type before processing
    validatePdfFile(blob);
    try {
      const arrayBuffer = await blobToArrayBuffer(blob);
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
      });

      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      return uint8ArrayToBlob(compressedBytes);
    } catch (error) {
      if (error instanceof PdfProcessingError) throw error;
      throw new PdfProcessingError(
        `Failed to compress PDF: ${error instanceof Error ? error.message : 'File may be corrupted'}`
      );
    }
  },

  /**
   * Convert images to PDF
   */
  imagesToPdf: async (imageBlobs: Blob[]): Promise<Blob> => {
    if (imageBlobs.length === 0) {
      throw new PdfProcessingError('No images to convert');
    }

    // Validate all image files for size and type before processing
    validateImageFilesForPdf(imageBlobs);

    const pdfDoc = await PDFDocument.create();

    for (const imageBlob of imageBlobs) {
      const imageBytes = await blobToArrayBuffer(imageBlob);
      const uint8Array = new Uint8Array(imageBytes);

      let image;
      if (imageBlob.type === 'image/png') {
        image = await pdfDoc.embedPng(uint8Array);
      } else if (imageBlob.type === 'image/jpeg' || imageBlob.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(uint8Array);
      } else {
        // Try to convert other formats via canvas
        const converted = await convertImageToJpeg(imageBlob);
        const convertedBytes = await blobToArrayBuffer(converted);
        image = await pdfDoc.embedJpg(new Uint8Array(convertedBytes));
      }

      const { width, height } = image;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return uint8ArrayToBlob(pdfBytes);
  },

  /**
   * Convert PDF pages to images
   */
  pdfToImages: async (
    blob: Blob,
    options: { scale?: number; format?: 'png' | 'jpeg' } = {}
  ): Promise<Blob[]> => {
    const { scale = 2, format = 'png' } = options;

    // Validate file size and type before processing
    validatePdfFile(blob);

    if (scale <= 0 || !Number.isFinite(scale)) {
      throw new PdfProcessingError('Scale must be a positive number');
    }

    try {
    const arrayBuffer = await blobToArrayBuffer(blob);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    const images: Blob[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new PdfProcessingError('Failed to create canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Type assertion needed for pdfjs-dist compatibility
      await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      } as Parameters<typeof page.render>[0]).promise;

      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) {
              resolve(b);
            } else {
              reject(new PdfProcessingError('Failed to convert page to image'));
            }
          },
          format === 'png' ? 'image/png' : 'image/jpeg',
          0.92
        );
      });

      images.push(imageBlob);
    }

    return images;
    } catch (error) {
      if (error instanceof PdfProcessingError) throw error;
      // Keep the technical cause out of the page. It stays in the console for debugging.
      console.error('PDF to image conversion failed', error);
      throw new PdfProcessingError(
        'Could not convert this PDF. The file may be damaged or password-protected. Try another file.'
      );
    }
  },

  /**
   * Generate a thumbnail of the first page
   */
  generateThumbnail: async (blob: Blob, maxSize = 200): Promise<string> => {
    // Validate file size and type before processing
    validatePdfFile(blob);

    try {
    const arrayBuffer = await blobToArrayBuffer(blob);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxSize / viewport.width, maxSize / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new PdfProcessingError('Failed to create canvas context');
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Type assertion needed for pdfjs-dist compatibility
    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport: scaledViewport,
    } as Parameters<typeof page.render>[0]).promise;

    return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      if (error instanceof PdfProcessingError) throw error;
      throw new PdfProcessingError(
        `Failed to generate thumbnail: ${error instanceof Error ? error.message : 'File may be corrupted'}`
      );
    }
  },
};

async function convertImageToJpeg(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new PdfProcessingError('Failed to create canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (resultBlob) => {
          if (resultBlob) {
            resolve(resultBlob);
          } else {
            reject(new PdfProcessingError('Failed to convert image'));
          }
        },
        'image/jpeg',
        0.92
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new PdfProcessingError('Failed to load image'));
    };
    img.src = URL.createObjectURL(blob);
  });
}
