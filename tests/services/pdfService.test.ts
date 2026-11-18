import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pdfService, PdfProcessingError } from '@/services/pdfService';

// Mock pdf-lib
vi.mock('pdf-lib', () => {
  const mockPage = {
    getWidth: vi.fn().mockReturnValue(612),
    getHeight: vi.fn().mockReturnValue(792),
    drawImage: vi.fn(),
  };

  const mockPdfDocument = {
    getPageCount: vi.fn().mockReturnValue(3),
    getPageIndices: vi.fn().mockReturnValue([0, 1, 2]),
    getPages: vi.fn().mockReturnValue([mockPage, mockPage, mockPage]),
    copyPages: vi.fn().mockResolvedValue([mockPage]),
    addPage: vi.fn().mockReturnValue(mockPage),
    setTitle: vi.fn(),
    setAuthor: vi.fn(),
    setSubject: vi.fn(),
    setKeywords: vi.fn(),
    setProducer: vi.fn(),
    setCreator: vi.fn(),
    embedPng: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
    embedJpg: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
  };

  return {
    PDFDocument: {
      create: vi.fn().mockResolvedValue({ ...mockPdfDocument }),
      load: vi.fn().mockResolvedValue({ ...mockPdfDocument }),
    },
  };
});

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => {
  const mockPage = {
    getViewport: vi.fn().mockReturnValue({ width: 612, height: 792 }),
    render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
  };

  const mockPdf = {
    numPages: 3,
    getPage: vi.fn().mockResolvedValue(mockPage),
  };

  return {
    GlobalWorkerOptions: { workerSrc: '' },
    version: '3.0.0',
    getDocument: vi.fn().mockReturnValue({
      promise: Promise.resolve(mockPdf),
    }),
  };
});

// Helper to create mock PDF blob
function createMockPdfBlob(): Blob {
  return new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' });
}

// Helper to create mock image blob
function createMockImageBlob(type = 'image/png'): Blob {
  return new Blob(['mock image data'], { type });
}

describe('pdfService edge cases - empty files', () => {
  const emptyBlob = new Blob([], { type: 'application/pdf' });

  it('getPageCount rejects empty blob', async () => {
    await expect(pdfService.getPageCount(emptyBlob)).rejects.toThrow('Cannot process empty file');
  });

  it('split rejects empty blob', async () => {
    await expect(pdfService.split(emptyBlob, [1])).rejects.toThrow('Cannot process empty file');
  });

  it('splitAll rejects empty blob', async () => {
    await expect(pdfService.splitAll(emptyBlob)).rejects.toThrow('Cannot process empty file');
  });

  it('compress rejects empty blob', async () => {
    await expect(pdfService.compress(emptyBlob)).rejects.toThrow('Cannot process empty file');
  });

  it('pdfToImages rejects empty blob', async () => {
    await expect(pdfService.pdfToImages(emptyBlob)).rejects.toThrow('Cannot process empty file');
  });

  it('generateThumbnail rejects empty blob', async () => {
    await expect(pdfService.generateThumbnail(emptyBlob)).rejects.toThrow('Cannot process empty file');
  });

  it('merge rejects when one file is empty', async () => {
    const validPdf = createMockPdfBlob();
    await expect(pdfService.merge([validPdf, emptyBlob])).rejects.toThrow('File 2 is empty');
  });

  it('imagesToPdf rejects when one image is empty', async () => {
    const validImage = createMockImageBlob('image/png');
    const emptyImage = new Blob([], { type: 'image/png' });
    await expect(pdfService.imagesToPdf([validImage, emptyImage])).rejects.toThrow('Image 2 is empty');
  });

  it('pdfToImages rejects invalid scale', async () => {
    const pdf = createMockPdfBlob();
    await expect(pdfService.pdfToImages(pdf, { scale: 0 })).rejects.toThrow('Scale must be a positive number');
    await expect(pdfService.pdfToImages(pdf, { scale: -1 })).rejects.toThrow('Scale must be a positive number');
  });
});

describe('pdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPageCount', () => {
    it('should return the number of pages', async () => {
      const pdf = createMockPdfBlob();
      const count = await pdfService.getPageCount(pdf);

      expect(count).toBe(3);
    });
  });

  describe('merge', () => {
    it('should merge multiple PDFs into one', async () => {
      const pdf1 = createMockPdfBlob();
      const pdf2 = createMockPdfBlob();

      const result = await pdfService.merge([pdf1, pdf2]);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should return single PDF as-is', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.merge([pdf]);

      expect(result).toBe(pdf);
    });

    it('should throw error for empty array', async () => {
      await expect(pdfService.merge([])).rejects.toThrow(PdfProcessingError);
      await expect(pdfService.merge([])).rejects.toThrow('No PDFs to merge');
    });

    it('should merge three PDFs', async () => {
      const pdfs = [createMockPdfBlob(), createMockPdfBlob(), createMockPdfBlob()];
      const result = await pdfService.merge(pdfs);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('split', () => {
    it('should extract specific pages', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.split(pdf, [1, 2]);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should extract single page', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.split(pdf, [1]);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should throw for empty page selection', async () => {
      const pdf = createMockPdfBlob();

      await expect(pdfService.split(pdf, [])).rejects.toThrow(PdfProcessingError);
      await expect(pdfService.split(pdf, [])).rejects.toThrow('No pages selected');
    });

    it('should filter out invalid page numbers', async () => {
      const pdf = createMockPdfBlob();

      // Pages 0, -1, and 100 are invalid (1-indexed, so 0 and negative are invalid)
      await expect(pdfService.split(pdf, [0, -1, 100])).rejects.toThrow(
        'No valid pages selected'
      );
    });

    it('should handle mixed valid and invalid pages', async () => {
      const pdf = createMockPdfBlob();
      // Page 1 is valid, 100 is invalid
      const result = await pdfService.split(pdf, [1, 100]);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('splitAll', () => {
    it('should split PDF into individual pages', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.splitAll(pdf);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3); // Mock has 3 pages
    });

    it('should return blobs for each page', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.splitAll(pdf);

      results.forEach((result) => {
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('application/pdf');
      });
    });
  });

  describe('compress', () => {
    it('should compress PDF', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.compress(pdf);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should remove metadata during compression', async () => {
      const pdf = createMockPdfBlob();
      await pdfService.compress(pdf);

      // Verify metadata removal was called
      const { PDFDocument } = await import('pdf-lib');
      const mockDoc = await PDFDocument.load(new ArrayBuffer(0));

      expect(mockDoc.setTitle).toHaveBeenCalled();
      expect(mockDoc.setAuthor).toHaveBeenCalled();
    });
  });

  describe('imagesToPdf', () => {
    it('should convert single PNG image to PDF', async () => {
      const image = createMockImageBlob('image/png');
      const result = await pdfService.imagesToPdf([image]);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should convert single JPEG image to PDF', async () => {
      const image = createMockImageBlob('image/jpeg');
      const result = await pdfService.imagesToPdf([image]);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should convert multiple images to PDF', async () => {
      const images = [
        createMockImageBlob('image/png'),
        createMockImageBlob('image/jpeg'),
      ];
      const result = await pdfService.imagesToPdf(images);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should throw for empty image array', async () => {
      await expect(pdfService.imagesToPdf([])).rejects.toThrow(PdfProcessingError);
      await expect(pdfService.imagesToPdf([])).rejects.toThrow('No images to convert');
    });

    it('should convert WebP images via canvas', async () => {
      const webpImage = createMockImageBlob('image/webp');
      const result = await pdfService.imagesToPdf([webpImage]);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('pdfToImages', () => {
    it('should convert PDF pages to images', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.pdfToImages(pdf);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3); // Mock has 3 pages
    });

    it('should respect PNG format option', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.pdfToImages(pdf, { format: 'png' });

      expect(results.length).toBeGreaterThan(0);
    });

    it('should respect JPEG format option', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.pdfToImages(pdf, { format: 'jpeg' });

      expect(results.length).toBeGreaterThan(0);
    });

    it('should respect scale option', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.pdfToImages(pdf, { scale: 1 });

      expect(results.length).toBeGreaterThan(0);
    });

    it('should use default options when not specified', async () => {
      const pdf = createMockPdfBlob();
      const results = await pdfService.pdfToImages(pdf);

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail data URL', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.generateThumbnail(pdf);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should use default max size', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.generateThumbnail(pdf);

      expect(result).toBeTruthy();
    });

    it('should respect custom max size', async () => {
      const pdf = createMockPdfBlob();
      const result = await pdfService.generateThumbnail(pdf, 100);

      expect(result).toBeTruthy();
    });
  });
});
