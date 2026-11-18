import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PdfToImage } from '@/components/tools/pdf/PdfToImage';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

vi.mock('pdfjs-dist', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    getDocument: vi.fn(),
    GlobalWorkerOptions: { workerSrc: '' },
  };
});

describe('PdfToImage', () => {
  it('renders tool header', () => {
    render(<MemoryRouter><PdfToImage /></MemoryRouter>);
    expect(screen.getByText('PDF to Image')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><PdfToImage /></MemoryRouter>);
    expect(screen.getByText('Convert PDF pages to images')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><PdfToImage /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
