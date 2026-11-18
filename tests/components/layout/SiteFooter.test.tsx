import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SiteFooter } from '@/components/layout/SiteFooter';

describe('SiteFooter', () => {
  it('shows the Zendren attribution with the current year and an author link', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    );
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year} Zendren · Built by`))).toBeInTheDocument();
    const author = screen.getByRole('link', { name: 'Xander M. Lopez' });
    expect(author).toHaveAttribute('href', 'https://xandermlopez.com');
    expect(author).toHaveAttribute('rel', 'author');
  });

  it('links to zendren.net and the privacy page', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'zendren.net' })).toHaveAttribute('href', 'https://zendren.net');
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });
});
