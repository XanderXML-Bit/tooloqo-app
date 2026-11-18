import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TextTools } from '@/pages/TextTools';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('TextTools', () => {
  it('renders page heading', () => {
    render(
      <MemoryRouter>
        <TextTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Text Tools')).toBeInTheDocument();
  });

  it('renders tool count', () => {
    render(
      <MemoryRouter>
        <TextTools />
      </MemoryRouter>
    );
    expect(screen.getByText('3 tools available')).toBeInTheDocument();
  });

  it('renders all tool names', () => {
    render(
      <MemoryRouter>
        <TextTools />
      </MemoryRouter>
    );
    expect(screen.getByText('Word Counter')).toBeInTheDocument();
    expect(screen.getByText('Case Converter')).toBeInTheDocument();
    expect(screen.getByText('Text Compare')).toBeInTheDocument();
  });

  it('links to correct routes', () => {
    render(
      <MemoryRouter>
        <TextTools />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/text/word-count');
    expect(hrefs).toContain('/text/case-convert');
    expect(hrefs).toContain('/text/text-compare');
  });
});
