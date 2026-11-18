import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';

function renderWithRouter(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <BottomNav />
    </MemoryRouter>
  );
}

describe('BottomNav', () => {
  it('renders navigation element with aria-label', () => {
    renderWithRouter();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('renders all five navigation tabs', () => {
    renderWithRouter();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('renders nav links with correct hrefs', () => {
    renderWithRouter();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/image');
    expect(hrefs).toContain('/pdf');
    expect(hrefs).toContain('/media');
    expect(hrefs).toContain('/text');
  });

  it('highlights Home tab on root route', () => {
    renderWithRouter('/');
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink?.className).toContain('text-primary');
  });

  it('highlights Image tab on image route', () => {
    renderWithRouter('/image');
    const imageLink = screen.getByText('Image').closest('a');
    expect(imageLink?.className).toContain('dark:text-blue-400');
  });

  it('highlights PDF tab on pdf route', () => {
    renderWithRouter('/pdf');
    const pdfLink = screen.getByText('PDF').closest('a');
    expect(pdfLink?.className).toContain('dark:text-red-400');
  });

  it('highlights Media tab on media route', () => {
    renderWithRouter('/media');
    const mediaLink = screen.getByText('Media').closest('a');
    expect(mediaLink?.className).toContain('dark:text-purple-400');
  });

  it('highlights Text tab on text route', () => {
    renderWithRouter('/text');
    const textLink = screen.getByText('Text').closest('a');
    expect(textLink?.className).toContain('text-tool-text');
  });

  it('non-active tabs have tertiary text color', () => {
    renderWithRouter('/');
    const imageLink = screen.getByText('Image').closest('a');
    expect(imageLink?.className).toContain('text-text-tertiary');
  });
});
