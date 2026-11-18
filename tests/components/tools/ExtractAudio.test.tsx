import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExtractAudio } from '@/components/tools/media/ExtractAudio';
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
    extractAudio: vi.fn(),
  },
}));

describe('ExtractAudio', () => {
  it('does not load the engine before file selection', () => {
    render(<MemoryRouter><ExtractAudio /></MemoryRouter>);
    expect(mediaService.loadFFmpeg).not.toHaveBeenCalled();
  });

  it('renders tool header', () => {
    render(<MemoryRouter><ExtractAudio /></MemoryRouter>);
    expect(screen.getByText('Extract Audio')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><ExtractAudio /></MemoryRouter>);
    expect(screen.getByText('Extract audio track from video files')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><ExtractAudio /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
