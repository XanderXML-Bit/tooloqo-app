import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FFmpeg
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false,
    on: vi.fn(),
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(0),
  })),
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  toBlobURL: vi.fn().mockImplementation((url: string) => Promise.resolve(url)),
}));

vi.mock('@/utils/validation', () => ({
  validateBeforeProcess: vi.fn(() => ({ valid: true })),
}));

import { MediaProcessingError, mediaService, isFFmpegLoaded } from '../../src/services/mediaService';

describe('mediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MediaProcessingError', () => {
    it('creates error with correct name and message', () => {
      const err = new MediaProcessingError('test error');
      expect(err.name).toBe('MediaProcessingError');
      expect(err.message).toBe('test error');
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('isFFmpegLoaded', () => {
    it('returns false before loading', () => {
      expect(isFFmpegLoaded()).toBe(false);
    });
  });

  describe('service exports', () => {
    it('exports all media functions', () => {
      expect(mediaService.loadFFmpeg).toBeDefined();
      expect(mediaService.isFFmpegLoaded).toBeDefined();
      expect(mediaService.convertAudio).toBeDefined();
      expect(mediaService.compressVideo).toBeDefined();
      expect(mediaService.videoToGif).toBeDefined();
      expect(mediaService.extractAudio).toBeDefined();
      expect(mediaService.getVideoDuration).toBeDefined();
    });
  });

  describe('getVideoDuration', () => {
    it('resolves with video duration', async () => {
      const mockVideo = {
        preload: '',
        onloadedmetadata: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: '',
        duration: 42.5,
      };

      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockVideo as unknown as HTMLVideoElement);

      const promise = mediaService.getVideoDuration(new Blob(['video'], { type: 'video/mp4' }));

      // Trigger metadata loaded
      mockVideo.onloadedmetadata!();

      const duration = await promise;
      expect(duration).toBe(42.5);
    });

    it('rejects on error', async () => {
      const mockVideo = {
        preload: '',
        onloadedmetadata: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: '',
        duration: 0,
      };

      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockVideo as unknown as HTMLVideoElement);

      const promise = mediaService.getVideoDuration(new Blob(['bad']));
      mockVideo.onerror!();

      await expect(promise).rejects.toThrow('Failed to load video metadata');
    });
  });

  describe('convertAudio', () => {
    it('converts audio and returns result', async () => {
      const input = new Blob(['audio-data'], { type: 'audio/wav' });
      const result = await mediaService.convertAudio(input, { format: 'mp3' }, undefined);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('audio/mpeg');
      expect(result.originalSize).toBe(input.size);
      expect(result.processedSize).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('passes bitrate and sampleRate options', async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const input = new Blob(['audio'], { type: 'audio/wav' });
      await mediaService.convertAudio(input, { format: 'wav', bitrate: 192, sampleRate: 48000 }, undefined);

      const mockInstance = vi.mocked(FFmpeg).mock.results[0]?.value;
      if (mockInstance) {
        const execCalls = vi.mocked(mockInstance.exec).mock.calls;
        const lastCall = execCalls[execCalls.length - 1][0] as string[];
        expect(lastCall).toContain('-b:a');
        expect(lastCall).toContain('192k');
        expect(lastCall).toContain('-ar');
        expect(lastCall).toContain('48000');
      }
    });

    it('rejects invalid input', async () => {
      const { validateBeforeProcess } = await import('@/utils/validation');
      vi.mocked(validateBeforeProcess).mockReturnValueOnce({ valid: false, error: 'Invalid audio file' });

      await expect(
        mediaService.convertAudio(new Blob(), { format: 'mp3' }, undefined)
      ).rejects.toThrow('Invalid audio file');
    });
  });

  describe('compressVideo', () => {
    it('compresses video with preset and returns result', async () => {
      const input = new Blob(['video-data'], { type: 'video/mp4' });
      const result = await mediaService.compressVideo(input, { preset: 'web' }, undefined);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('video/mp4');
      expect(result.originalSize).toBe(input.size);
      expect(result.processedSize).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('rejects invalid input', async () => {
      const { validateBeforeProcess } = await import('@/utils/validation');
      vi.mocked(validateBeforeProcess).mockReturnValueOnce({ valid: false, error: 'Invalid video' });

      await expect(
        mediaService.compressVideo(new Blob(), { preset: 'web' }, undefined)
      ).rejects.toThrow('Invalid video');
    });
  });

  describe('videoToGif', () => {
    it('converts video to GIF with two-pass encoding', async () => {
      const input = new Blob(['video-data'], { type: 'video/mp4' });
      const result = await mediaService.videoToGif(
        input,
        { startTime: 0, endTime: 5, fps: 10, width: 480 },
        undefined
      );

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('image/gif');
      expect(result.originalSize).toBe(input.size);
      expect(result.processedSize).toBeGreaterThan(0);
    });

    it('rejects when endTime <= startTime', async () => {
      await expect(
        mediaService.videoToGif(
          new Blob(['vid'], { type: 'video/mp4' }),
          { startTime: 5, endTime: 3, fps: 10, width: 480 },
          undefined
        )
      ).rejects.toThrow('End time must be greater than start time');
    });

    it('rejects when endTime equals startTime', async () => {
      await expect(
        mediaService.videoToGif(
          new Blob(['vid'], { type: 'video/mp4' }),
          { startTime: 5, endTime: 5, fps: 10, width: 480 },
          undefined
        )
      ).rejects.toThrow('End time must be greater than start time');
    });

    it('rejects invalid input', async () => {
      const { validateBeforeProcess } = await import('@/utils/validation');
      vi.mocked(validateBeforeProcess).mockReturnValueOnce({ valid: false, error: 'Bad video' });

      await expect(
        mediaService.videoToGif(
          new Blob(),
          { startTime: 0, endTime: 5, fps: 10, width: 480 },
          undefined
        )
      ).rejects.toThrow('Bad video');
    });
  });

  describe('extractAudio', () => {
    it('extracts audio from video and returns result', async () => {
      const input = new Blob(['video-data'], { type: 'video/mp4' });
      const result = await mediaService.extractAudio(input, { format: 'mp3' }, undefined);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('audio/mpeg');
      expect(result.originalSize).toBe(input.size);
      expect(result.processedSize).toBeGreaterThan(0);
    });

    it('passes bitrate option when specified', async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const input = new Blob(['video'], { type: 'video/mp4' });
      await mediaService.extractAudio(input, { format: 'aac', bitrate: 256 }, undefined);

      const mockInstance = vi.mocked(FFmpeg).mock.results[0]?.value;
      if (mockInstance) {
        const execCalls = vi.mocked(mockInstance.exec).mock.calls;
        const lastCall = execCalls[execCalls.length - 1][0] as string[];
        expect(lastCall).toContain('-b:a');
        expect(lastCall).toContain('256k');
        expect(lastCall).toContain('-vn');
      }
    });

    it('rejects invalid input', async () => {
      const { validateBeforeProcess } = await import('@/utils/validation');
      vi.mocked(validateBeforeProcess).mockReturnValueOnce({ valid: false, error: 'Not a video' });

      await expect(
        mediaService.extractAudio(new Blob(), { format: 'mp3' }, undefined)
      ).rejects.toThrow('Not a video');
    });
  });
});
