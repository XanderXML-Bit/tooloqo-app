import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { useFileStore } from '@/stores/fileStore';

describe('Home', () => {
  beforeEach(() => {
    useFileStore.setState({ files: [], processingJobs: [] });
  });

  it('renders tagline', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Your precision file toolkit')).toBeInTheDocument();
  });

  it('renders tool category descriptions', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Resize, compress, crop & convert')).toBeInTheDocument();
    expect(screen.getByText('Merge, split, compress & convert')).toBeInTheDocument();
    expect(screen.getByText('Word count, case & compare')).toBeInTheDocument();
    expect(screen.getByText('Compress, GIF, extract & convert')).toBeInTheDocument();
  });

  it('renders correct tool counts', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getAllByText('5 tools')).toHaveLength(2); // Image + PDF
    expect(screen.getByText('3 tools')).toBeInTheDocument(); // Text
    expect(screen.getByText('4 tools')).toBeInTheDocument(); // Media
  });

  it('shows links to category pages', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/image');
    expect(hrefs).toContain('/pdf');
    expect(hrefs).toContain('/text');
    expect(hrefs).toContain('/media');
  });
});
