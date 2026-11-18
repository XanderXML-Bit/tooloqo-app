import { describe, it, expect, vi, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Component that throws based on a ref
let shouldThrow = false;

function ThrowingComponent() {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when no error', () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    shouldThrow = false;
  });

  it('renders custom fallback when provided', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    shouldThrow = false;
  });

  it('has Try Again button that resets error state', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing before clicking Try Again
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('has Refresh App button', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Refresh App')).toBeInTheDocument();
    shouldThrow = false;
  });
});
