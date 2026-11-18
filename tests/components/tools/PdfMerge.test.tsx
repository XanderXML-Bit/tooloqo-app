import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PdfMerge } from '@/components/tools/pdf/PdfMerge';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('PdfMerge', () => {
  it('renders tool header', () => {
    render(<MemoryRouter><PdfMerge /></MemoryRouter>);
    expect(screen.getByText('Merge PDFs')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><PdfMerge /></MemoryRouter>);
    expect(screen.getByText('Combine multiple PDFs into one')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><PdfMerge /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
