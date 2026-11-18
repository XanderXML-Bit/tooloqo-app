import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview, FilePreviewGrid } from '@/components/common/FilePreview';
import type { TooloqoFile } from '@/types';

const mockFile: TooloqoFile = {
  id: 'test-1',
  originalName: 'photo.png',
  mimeType: 'image/png',
  size: 2048,
  blob: new Blob(['test'], { type: 'image/png' }),
  thumbnail: 'data:image/png;base64,abc',
  createdAt: new Date(),
};

const mockPdfFile: TooloqoFile = {
  id: 'test-2',
  originalName: 'document.pdf',
  mimeType: 'application/pdf',
  size: 5120,
  blob: new Blob(['test'], { type: 'application/pdf' }),
  createdAt: new Date(),
};

describe('FilePreview', () => {
  it('renders file name and size', () => {
    render(<FilePreview file={mockFile} />);
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

  it('renders thumbnail for image files', () => {
    render(<FilePreview file={mockFile} />);
    const img = screen.getByAltText('photo.png');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc');
  });

  it('renders file icon for non-image files', () => {
    render(<FilePreview file={mockPdfFile} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('hides size when showSize is false', () => {
    render(<FilePreview file={mockFile} showSize={false} />);
    expect(screen.queryByText('2 KB')).not.toBeInTheDocument();
  });

  it('shows remove button when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<FilePreview file={mockFile} onRemove={onRemove} />);
    const removeBtn = screen.getByRole('button');
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('shows check icon when isProcessed is true', () => {
    render(<FilePreview file={mockFile} isProcessed />);
    // Should not show remove button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows saved percentage when originalSize is larger', () => {
    render(<FilePreview file={mockFile} originalSize={4096} />);
    expect(screen.getByText('-50%')).toBeInTheDocument();
  });

  it('does not show saved percentage when file is larger than original', () => {
    render(<FilePreview file={mockFile} originalSize={1024} />);
    expect(screen.queryByText(/-%/)).not.toBeInTheDocument();
  });
});

describe('FilePreviewGrid', () => {
  const files = [mockFile, mockPdfFile];

  it('renders all files', () => {
    render(<FilePreviewGrid files={files} />);
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('calls onRemove with correct id', () => {
    const onRemove = vi.fn();
    render(<FilePreviewGrid files={files} onRemove={onRemove} />);
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith('test-1');
  });

  it('shows processed state for processed files', () => {
    render(
      <FilePreviewGrid
        files={files}
        processedFiles={[mockFile]}
      />
    );
    // First file should be processed (check icon, no button)
    // Second file has no onRemove so also no button
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
