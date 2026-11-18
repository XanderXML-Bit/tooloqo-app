import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Image } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Image}
        title="No files"
        description="Drop files to get started"
      />
    );
    expect(screen.getByText('No files')).toBeInTheDocument();
    expect(screen.getByText('Drop files to get started')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={Image}
        title="No files"
        description="Drop files to get started"
        action={{ label: 'Upload', onClick }}
      />
    );
    const button = screen.getByText('Upload');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render action button when not provided', () => {
    render(
      <EmptyState
        icon={Image}
        title="No files"
        description="Drop files to get started"
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies subtle variant class', () => {
    const { container } = render(
      <EmptyState
        icon={Image}
        title="No files"
        description="Drop files"
        variant="subtle"
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('py-8');
  });

  it('uses category colors', () => {
    const { container } = render(
      <EmptyState
        icon={Image}
        title="No files"
        description="Drop files"
        category="pdf"
      />
    );
    // PDF category uses red colors
    expect(container.innerHTML).toContain('red');
  });
});
