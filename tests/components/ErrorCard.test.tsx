import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorCard } from '@/components/common/ErrorCard';

describe('ErrorCard', () => {
  it('renders error message', () => {
    render(<ErrorCard error="Something went wrong" onRetry={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button with default text', () => {
    render(<ErrorCard error="Error" onRetry={vi.fn()} />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders custom retry text', () => {
    render(<ErrorCard error="Error" onRetry={vi.fn()} retryText="Reload" />);
    expect(screen.getByText('Reload')).toBeInTheDocument();
  });

  it('calls onRetry when button clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorCard error="Error" onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
