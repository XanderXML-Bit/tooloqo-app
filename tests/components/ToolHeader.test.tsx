import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Image } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';

describe('ToolHeader', () => {
  it('renders title and description', () => {
    render(
      <ToolHeader
        category="image"
        icon={Image}
        title="Image Resize"
        description="Resize images for social media"
      />
    );
    expect(screen.getByText('Image Resize')).toBeInTheDocument();
    expect(screen.getByText('Resize images for social media')).toBeInTheDocument();
  });

  it('renders as section with an h2 (the page h1 is the Header title)', () => {
    render(
      <ToolHeader
        category="pdf"
        icon={Image}
        title="PDF Merge"
        description="Combine PDFs"
      />
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('PDF Merge');
  });

  it('applies category-specific styles', () => {
    const { container } = render(
      <ToolHeader
        category="text"
        icon={Image}
        title="Word Count"
        description="Count words"
      />
    );
    expect(container.innerHTML).toContain('tool-text');
  });
});
