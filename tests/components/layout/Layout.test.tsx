import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

// Mock sub-components
vi.mock('@/components/layout/Header', () => ({
  Header: ({ title, showBack }: { title?: string; showBack?: boolean }) => (
    <div data-testid="header" data-title={title} data-showback={showBack}>
      Header
    </div>
  ),
}));

vi.mock('@/components/layout/BottomNav', () => ({
  BottomNav: () => <nav data-testid="bottom-nav">BottomNav</nav>,
}));

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('renders children content', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Header component', () => {
    renderWithRouter(
      <Layout title="My Title">
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('passes title to Header', () => {
    renderWithRouter(
      <Layout title="Image Tools">
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByTestId('header')).toHaveAttribute('data-title', 'Image Tools');
  });

  it('passes showBack to Header', () => {
    renderWithRouter(
      <Layout showBack>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByTestId('header')).toHaveAttribute('data-showback', 'true');
  });

  it('shows BottomNav when showNav is true (default)', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('hides BottomNav when showNav is false', () => {
    renderWithRouter(
      <Layout showNav={false}>
        <div>Content</div>
      </Layout>
    );
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
  });

  it('renders ambient glow elements', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    // Should contain gradient glow divs
    const glowDivs = container.querySelectorAll('[class*="pointer-events-none"]');
    expect(glowDivs.length).toBeGreaterThan(0);
  });

  it('renders with different route categories', () => {
    // Image route
    const { unmount } = renderWithRouter(
      <Layout>
        <div>Image</div>
      </Layout>,
      { route: '/image/resize' }
    );
    expect(screen.getByText('Image')).toBeInTheDocument();
    unmount();

    // PDF route
    renderWithRouter(
      <Layout>
        <div>PDF</div>
      </Layout>,
      { route: '/pdf/merge' }
    );
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('renders main element with proper classes', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });
  it('makes <main> the scroll container so content below the fold (and the footer) is reachable', () => {
    // html/body are overflow:hidden (index.html), so the shell must be viewport-height
    // and <main> must be allowed to shrink (min-h-0) for overflow-y-auto to scroll.
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    const shell = container.firstElementChild as HTMLElement;
    expect(shell.className).toContain('h-dvh');
    expect(shell.className).not.toContain('min-h-screen');
    const main = screen.getByRole('main');
    expect(main.className).toContain('min-h-0');
    expect(main.className).toContain('overflow-y-auto');
    expect(main.querySelector('footer a[rel="author"]')).not.toBeNull();
  });
});

describe('Layout tab bar clearance (audit item 6)', () => {
  it('ends the scroll area above the fixed tab bar when the bar shows', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    const shell = container.firstElementChild as HTMLElement;
    expect(shell.className).toContain('pb-[calc(4rem+1px+max(var(--safe-bottom),12px))]');
    expect(screen.getByRole('main').className).toContain('pb-4');
  });

  it('adds no bar clearance when the bar is hidden', () => {
    const { container } = renderWithRouter(
      <Layout showNav={false}>
        <div>Content</div>
      </Layout>
    );
    const shell = container.firstElementChild as HTMLElement;
    expect(shell.className).not.toContain('pb-[calc');
  });
});
