import { describe, expect, it, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { pdfService, PdfProcessingError } from '@/services/pdfService';

// Rendering is outside these in-memory PDF transformation tests.
vi.mock('pdfjs-dist', () => ({ GlobalWorkerOptions: {}, version: 'test' }));

async function makePdf(widths: number[]): Promise<Blob> {
  const doc = await PDFDocument.create();
  widths.forEach(width => doc.addPage([width, 200]));
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

async function pageWidths(blob: Blob): Promise<number[]> {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  return doc.getPages().map(page => page.getWidth());
}

describe('PDF utilities with real local documents', () => {
  it('merges every page in input order', async () => {
    const output = await pdfService.merge([await makePdf([100, 120]), await makePdf([180])]);
    expect(output.type).toBe('application/pdf');
    expect(await pageWidths(output)).toEqual([100, 120, 180]);
    expect(await pdfService.getPageCount(output)).toBe(3);
  });

  it('extracts selected pages in requested order, preserving duplicates and filtering invalid pages', async () => {
    const output = await pdfService.split(await makePdf([100, 120, 180]), [3, 0, 1, 3, 99]);
    expect(await pageWidths(output)).toEqual([180, 100, 180]);
  });

  it('splits every page into a valid single-page PDF', async () => {
    const outputs = await pdfService.splitAll(await makePdf([100, 120]));
    expect(outputs).toHaveLength(2);
    expect(await Promise.all(outputs.map(pageWidths))).toEqual([[100], [120]]);
  });

  it('clears metadata while preserving page content and leaving the source unchanged', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([150, 200]);
    doc.setTitle('Local fixture');
    doc.setAuthor('Test author');
    const source = new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' });
    const output = await pdfService.compress(source);
    const compressed = await PDFDocument.load(await output.arrayBuffer(), { updateMetadata: false });
    expect(compressed.getTitle()).toBe('');
    expect(compressed.getAuthor()).toBe('');
    expect(await pageWidths(output)).toEqual([150]);
    const original = await PDFDocument.load(await source.arrayBuffer());
    expect(original.getTitle()).toBe('Local fixture');
  });

  it.each(['getPageCount', 'splitAll', 'compress'] as const)('wraps corrupt input errors in %s', async method => {
    const corrupt = new Blob(['not a PDF'], { type: 'application/pdf' });
    await expect(pdfService[method](corrupt)).rejects.toThrow(PdfProcessingError);
  });
});
