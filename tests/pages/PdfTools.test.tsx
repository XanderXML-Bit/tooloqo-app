import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PdfTools } from '@/pages/PdfTools';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('PdfTools', () => {
  it('renders page heading', () => {
    render(
      <MemoryRouter>
        <PdfTools />
      </MemoryRouter>
    );
    expect(screen.getByText('PDF Tools')).toBeInTheDocument();
  });

  it('renders available tool names', () => {
    render(
      <MemoryRouter>
        <PdfTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Merge')).toBeInTheDocument();
    expect(screen.getByText('Split')).toBeInTheDocument();
    expect(screen.getByText('Image to PDF')).toBeInTheDocument();
    expect(screen.getByText('PDF to Image')).toBeInTheDocument();
  });

  it('does not advertise unbuilt tools', () => {
    render(
      <MemoryRouter>
        <PdfTools />
      </MemoryRouter>
    );
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('OCR')).not.toBeInTheDocument();
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign')).not.toBeInTheDocument();
  });

  it('links to correct routes', () => {
    render(
      <MemoryRouter>
        <PdfTools />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/pdf/merge');
    expect(hrefs).toContain('/pdf/split');
  });
});
