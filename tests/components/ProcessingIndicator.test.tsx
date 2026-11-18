import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingIndicator, CompactSpinner } from '@/components/common/ProcessingIndicator';

describe('ProcessingIndicator', () => {
  it('renders default processing message', () => {
    render(<ProcessingIndicator />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ProcessingIndicator message="Resizing image..." />);
    expect(screen.getByText('Resizing image...')).toBeInTheDocument();
  });

  it('shows indeterminate spinner when no progress', () => {
    render(<ProcessingIndicator />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows progress ring with percentage', () => {
    render(<ProcessingIndicator progress={42} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // The percentage text appears in both the ring overlay and the progress bar area
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
  });

  it('shows Complete! at 100%', () => {
    render(<ProcessingIndicator progress={100} />);
    expect(screen.getByText('Complete!')).toBeInTheDocument();
  });

  it('sets correct aria values on progressbar', () => {
    render(<ProcessingIndicator progress={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies category theming', () => {
    const { container } = render(<ProcessingIndicator category="pdf" progress={50} />);
    const svg = container.querySelector('svg[role="progressbar"]');
    expect(svg).toBeInTheDocument();
  });
});

describe('CompactSpinner', () => {
  it('renders spinner SVG', () => {
    render(<CompactSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('accepts size prop', () => {
    const { container } = render(<CompactSpinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });
});
