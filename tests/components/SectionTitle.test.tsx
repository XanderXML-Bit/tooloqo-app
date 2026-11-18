import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionTitle } from '@/components/common/SectionTitle';

describe('SectionTitle', () => {
  it('renders children text', () => {
    render(<SectionTitle category="image">Settings</SectionTitle>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders as h3', () => {
    render(<SectionTitle category="pdf">Options</SectionTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Options');
  });

  it('renders category dot with correct color', () => {
    const { container } = render(
      <SectionTitle category="media">Format</SectionTitle>
    );
    expect(container.innerHTML).toContain('tool-media');
  });
});
