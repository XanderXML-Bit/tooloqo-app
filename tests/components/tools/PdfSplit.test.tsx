import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PdfSplit } from '@/components/tools/pdf/PdfSplit';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('PdfSplit', () => {
  it('renders tool header', () => {
    render(<MemoryRouter><PdfSplit /></MemoryRouter>);
    expect(screen.getByText('Split PDF')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><PdfSplit /></MemoryRouter>);
    expect(screen.getByText('Extract pages or split into individual files')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><PdfSplit /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
