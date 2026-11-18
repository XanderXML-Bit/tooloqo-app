import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VideoToGif } from '@/components/tools/media/VideoToGif';
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
    videoToGif: vi.fn(),
  },
}));

describe('VideoToGif', () => {
  it('does not load the engine before file selection', () => {
    render(<MemoryRouter><VideoToGif /></MemoryRouter>);
    expect(mediaService.loadFFmpeg).not.toHaveBeenCalled();
  });

  it('renders tool header', () => {
    render(<MemoryRouter><VideoToGif /></MemoryRouter>);
    expect(screen.getByText('Video to GIF')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><VideoToGif /></MemoryRouter>);
    expect(screen.getByText('Convert video clips to animated GIFs')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><VideoToGif /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
