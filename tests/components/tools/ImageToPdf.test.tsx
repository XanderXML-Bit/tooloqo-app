import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageToPdf } from '@/components/tools/pdf/ImageToPdf';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('ImageToPdf', () => {
  it('renders tool header', () => {
    render(<MemoryRouter><ImageToPdf /></MemoryRouter>);
    expect(screen.getByText('Image to PDF')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><ImageToPdf /></MemoryRouter>);
    expect(screen.getByText('Convert images into a PDF document')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><ImageToPdf /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
