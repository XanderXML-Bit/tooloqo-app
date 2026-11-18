import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AudioConvert } from '@/components/tools/media/AudioConvert';
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
    convertAudio: vi.fn(),
  },
}));

describe('AudioConvert', () => {
  it('does not load the engine before file selection', () => {
    render(<MemoryRouter><AudioConvert /></MemoryRouter>);
    expect(mediaService.loadFFmpeg).not.toHaveBeenCalled();
  });

  it('renders tool header', () => {
    render(<MemoryRouter><AudioConvert /></MemoryRouter>);
    expect(screen.getByText('Audio Converter')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MemoryRouter><AudioConvert /></MemoryRouter>);
    expect(screen.getByText('Convert between audio formats')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<MemoryRouter><AudioConvert /></MemoryRouter>);
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
