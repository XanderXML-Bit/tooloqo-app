import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VideoCompress } from '@/components/tools/media/VideoCompress';
import { mediaService } from '@/services/mediaService';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

vi.mock('@/services/mediaService', () => ({
  mediaService: {
    isFFmpegLoaded: vi.fn(() => false),
    loadFFmpeg: vi.fn(() => Promise.resolve()),
    compressVideo: vi.fn(),
  },
}));

describe('VideoCompress', () => {
  it('does not load the engine before file selection', () => {
    render(<MemoryRouter><VideoCompress /></MemoryRouter>);
    expect(mediaService.loadFFmpeg).not.toHaveBeenCalled();
  });

  it('renders tool header', () => {
    render(<MemoryRouter><VideoCompress /></MemoryRouter>);
    expect(screen.getByText('Video Compressor')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><VideoCompress /></MemoryRouter>);
    expect(screen.getByText('Reduce video file sizes on-device')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><VideoCompress /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
