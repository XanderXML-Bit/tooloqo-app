import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '@/pages/NotFound';

describe('NotFound', () => {
  it('renders 404 heading', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('has Go Home link pointing to /', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    const link = screen.getByText('Go Home').closest('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('has Go Back button that calls history.back', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Go Back'));
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
