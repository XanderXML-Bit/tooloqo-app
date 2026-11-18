import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DownloadButton, DownloadAllButton } from '@/components/common/DownloadButton';
import type { TooloqoFile } from '@/types';

// Mock the utils module for downloadBlob
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    downloadBlob: vi.fn(),
  };
});

const mockFile: TooloqoFile = {
  id: 'test-1',
  originalName: 'test-image.png',
  mimeType: 'image/png',
  size: 1024,
  blob: new Blob(['test'], { type: 'image/png' }),
  createdAt: new Date(),
};

describe('DownloadButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders download button with file size', () => {
    render(<DownloadButton file={mockFile} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('hides size when showSize is false', () => {
    render(<DownloadButton file={mockFile} showSize={false} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
    // No size span rendered
    expect(screen.queryByText(/KB/)).not.toBeInTheDocument();
  });

  it('shows success state after download', () => {
    vi.useFakeTimers();
    render(<DownloadButton file={mockFile} />);

    act(() => {
      fireEvent.click(screen.getByText('Download'));
    });
    expect(screen.getByText('Downloaded!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('share button has aria-label when share API available', () => {
    // Mock navigator.share
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    render(<DownloadButton file={mockFile} />);
    expect(screen.getByLabelText('Share file')).toBeInTheDocument();

    // Restore
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      writable: true,
      configurable: true,
    });
  });
});

describe('DownloadAllButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const mockFiles: TooloqoFile[] = [
    { ...mockFile, id: '1', originalName: 'file1.png' },
    { ...mockFile, id: '2', originalName: 'file2.png', size: 2048 },
  ];

  it('renders with file count', () => {
    render(<DownloadAllButton files={mockFiles} />);
    expect(screen.getByText('Download All')).toBeInTheDocument();
    expect(screen.getByText(/2 files/)).toBeInTheDocument();
  });

  it('shows downloading state', () => {
    vi.useFakeTimers();
    render(<DownloadAllButton files={mockFiles} />);
    act(() => {
      fireEvent.click(screen.getByText('Download All'));
    });
    expect(screen.getByText('Downloading...')).toBeInTheDocument();
  });

  it('shows success after all downloads complete', () => {
    vi.useFakeTimers();
    render(<DownloadAllButton files={mockFiles} />);
    act(() => {
      fireEvent.click(screen.getByText('Download All'));
    });

    // Staggered downloads: 0ms, 200ms
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText('All Downloaded!')).toBeInTheDocument();
  });
});
