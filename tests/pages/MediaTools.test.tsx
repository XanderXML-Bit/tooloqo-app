import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MediaTools } from '@/pages/MediaTools';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('MediaTools', () => {
  it('renders page heading', () => {
    render(
      <MemoryRouter>
        <MediaTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Media Tools')).toBeInTheDocument();
  });

  it('renders tool count', () => {
    render(
      <MemoryRouter>
        <MediaTools />
      </MemoryRouter>
    );
    expect(screen.getByText('4 tools available')).toBeInTheDocument();
  });

  it('renders all tool names', () => {
    render(
      <MemoryRouter>
        <MediaTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Compress Video')).toBeInTheDocument();
    expect(screen.getByText('Video to GIF')).toBeInTheDocument();
    expect(screen.getByText('Extract Audio')).toBeInTheDocument();
    expect(screen.getByText('Convert Audio')).toBeInTheDocument();
  });

  it('links to correct routes', () => {
    render(
      <MemoryRouter>
        <MediaTools />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/media/video-compress');
    expect(hrefs).toContain('/media/video-to-gif');
    expect(hrefs).toContain('/media/extract-audio');
    expect(hrefs).toContain('/media/audio-convert');
  });
});
