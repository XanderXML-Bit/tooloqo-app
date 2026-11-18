import { afterEach, describe, expect, it, vi } from 'vitest';
import { imageService, ImageProcessingError } from '@/services/imageService';

const png = new Blob(['image'], { type: 'image/png' });

// Exercise geometry and encoding decisions without real image decoding or workers.
describe('image utility geometry and encoding', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    [80, 40, true, 40, 40],
    [40, 80, true, 40, 40],
    [80, 40, false, 80, 40],
    [8192, 4096, false, 4096, 2048],
    [4096, 8192, false, 2048, 4096],
  ])('resizes into %ix%i (aspect ratio %s)', async (width, height, maintainAspectRatio, expectedWidth, expectedHeight) => {
    const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob');
    const result = await imageService.resize(png, { width, height, maintainAspectRatio });
    const outputCanvas = encode.mock.instances[0];
    expect([outputCanvas.width, outputCanvas.height]).toEqual([expectedWidth, expectedHeight]);
    expect(result.type).toBe('image/png');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it.each([
    ['png', undefined, 'image/png'],
    ['jpg', 0.75, 'image/jpeg'],
    ['webp', 0.75, 'image/webp'],
  ] as const)('encodes %s with the correct MIME type and quality', async (format, quality, mimeType) => {
    const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob');
    const output = await imageService.convert(png, { format, quality: 75 });
    expect(encode).toHaveBeenCalledWith(expect.any(Function), mimeType, quality);
    expect(output.type).toBe(mimeType);
  });

  it('reports encoder failure instead of resolving an empty result', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(null));
    await expect(imageService.convert(png, { format: 'png' })).rejects.toThrow(ImageProcessingError);
  });

  it('rejects an unsupported input before allocating a URL', async () => {
    const invalid = new Blob(['text'], { type: 'text/plain' });
    await expect(imageService.resize(invalid, { width: 20, height: 20, maintainAspectRatio: false }))
      .rejects.toThrow('Invalid file type');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
