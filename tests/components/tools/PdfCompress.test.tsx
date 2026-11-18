import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PdfCompress } from '@/components/tools/pdf/PdfCompress';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('PdfCompress', () => {
  it('renders tool header', () => {
    render(<MemoryRouter><PdfCompress /></MemoryRouter>);
    expect(screen.getByText('Compress PDF')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><PdfCompress /></MemoryRouter>);
    expect(screen.getByText('Reduce file size by optimizing')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><PdfCompress /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
