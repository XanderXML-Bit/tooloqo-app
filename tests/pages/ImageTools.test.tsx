import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageTools } from '@/pages/ImageTools';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('ImageTools', () => {
  it('renders page heading', () => {
    render(
      <MemoryRouter>
        <ImageTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Image Tools')).toBeInTheDocument();
  });

  it('renders available tools count', () => {
    render(
      <MemoryRouter>
        <ImageTools />
      </MemoryRouter>
    );
    expect(screen.getByText('5 tools available')).toBeInTheDocument();
  });

  it('renders all available tool names', () => {
    render(
      <MemoryRouter>
        <ImageTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Resize')).toBeInTheDocument();
    expect(screen.getByText('Compress')).toBeInTheDocument();
    expect(screen.getByText('Crop')).toBeInTheDocument();
    expect(screen.getByText('Convert')).toBeInTheDocument();
    expect(screen.getByText('Rotate & Flip')).toBeInTheDocument();
  });

  it('does not advertise unbuilt tools', () => {
    render(
      <MemoryRouter>
        <ImageTools />
      </MemoryRouter>
    );
    expect(screen.queryByText('Remove BG')).not.toBeInTheDocument();
    expect(screen.queryByText('Upscale')).not.toBeInTheDocument();
    expect(screen.queryByText('Watermark')).not.toBeInTheDocument();
  });

  it('links available tools to correct routes', () => {
    render(
      <MemoryRouter>
        <ImageTools />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/image/resize');
    expect(hrefs).toContain('/image/compress');
    expect(hrefs).toContain('/image/crop');
  });

  it('renders the Available heading and no Coming Soon section', () => {
    render(
      <MemoryRouter>
        <ImageTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });
});
