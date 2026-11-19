import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SiteFooter } from '@/components/layout/SiteFooter';

describe('SiteFooter', () => {
  it('shows the Zendren copyright with the current year', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    );
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Zendren`)).toBeInTheDocument();
  });

  it('links only to zendren.net and the privacy page', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    );
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'zendren.net' })).toHaveAttribute('href', 'https://zendren.net');
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });
});
