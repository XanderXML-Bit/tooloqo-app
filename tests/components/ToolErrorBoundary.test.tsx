import { describe, it, expect, vi, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolErrorBoundary } from '@/components/common/ToolErrorBoundary';

let shouldThrow = false;

function ThrowingComponent() {
  if (shouldThrow) {
    throw new Error('Canvas rendering failed');
  }
  return <div>Tool content</div>;
}

describe('ToolErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when no error', () => {
    shouldThrow = false;
    render(
      <ToolErrorBoundary toolName="Image Resize">
        <ThrowingComponent />
      </ToolErrorBoundary>
    );
    expect(screen.getByText('Tool content')).toBeInTheDocument();
  });

  it('renders tool-specific error UI when child throws', () => {
    shouldThrow = true;
    render(
      <ToolErrorBoundary toolName="Image Resize">
        <ThrowingComponent />
      </ToolErrorBoundary>
    );
    expect(screen.getByText('Image Resize encountered an error')).toBeInTheDocument();
    expect(screen.getByText('Canvas rendering failed')).toBeInTheDocument();
    expect(screen.getByText(/Your other tools are unaffected/)).toBeInTheDocument();
    shouldThrow = false;
  });

  it('renders generic message without toolName', () => {
    shouldThrow = true;
    render(
      <ToolErrorBoundary>
        <ThrowingComponent />
      </ToolErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    shouldThrow = false;
  });

  it('Try Again resets error state', () => {
    shouldThrow = true;
    render(
      <ToolErrorBoundary toolName="PDF Merge">
        <ThrowingComponent />
      </ToolErrorBoundary>
    );
    expect(screen.getByText('PDF Merge encountered an error')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText('Tool content')).toBeInTheDocument();
  });

  it('has Go Back button', () => {
    shouldThrow = true;
    render(
      <ToolErrorBoundary toolName="Video Compress">
        <ThrowingComponent />
      </ToolErrorBoundary>
    );
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    shouldThrow = false;
  });

  it('calls window.history.back on Go Back click', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    shouldThrow = true;
    render(
      <ToolErrorBoundary>
        <ThrowingComponent />
      </ToolErrorBoundary>
    );
    fireEvent.click(screen.getByText('Go Back'));
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
    shouldThrow = false;
  });
});
