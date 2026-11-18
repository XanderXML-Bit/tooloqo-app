import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

describe('SkipLink', () => {
  it('is the first focusable element and moves focus to the main landmark', () => {
    render(
      <MemoryRouter>
        <Layout title="Test">Page body</Layout>
      </MemoryRouter>
    );
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    const focusable = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(focusable[0]).toBe(skip);
    expect(skip).toHaveAttribute('href', '#main');

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main');
    fireEvent.click(skip);
    expect(main).toHaveFocus();
    expect(window.location.hash).toBe('');
  });
});
