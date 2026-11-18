/**
 * TestDriver — UI simulation harness for Tooloqo.
 *
 * Wraps app services and state, exposes methods for every user action,
 * enforces preconditions, and returns structured state feedback.
 */

import { imageService } from '@/services/imageService';
import { pdfService } from '@/services/pdfService';
import { textService } from '@/services/textService';
import { mediaService } from '@/services/mediaService';
import {
  validateNumber,
  validateBeforeProcess,
  validateBatchBeforeProcess,
} from '@/utils/validation';
import type {
  ToolType,
  ToolCategory,
  ImageResizeOptions,
  ImageCompressOptions,
  ImageConvertOptions,
  ImageRotateOptions,
  AudioConvertOptions,
  VideoCompressOptions,
  VideoToGifOptions,
  ExtractAudioOptions,
} from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DriverResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface WordCountData {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export interface DiffLine {
  type: 'equal' | 'add' | 'remove';
  value: string;
}

export interface BlobResult {
  blob: Blob;
  originalSize: number;
  processedSize: number;
}

export interface MediaResult extends BlobResult {
  duration?: number;
}

export type ActiveTool = ToolType | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ok<T>(data: T): DriverResult<T> {
  return { ok: true, data };
}

function fail(error: string): DriverResult<never> {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// TestDriver
// ---------------------------------------------------------------------------

export class TestDriver {
  /** Currently selected tool (simulates navigation). */
  activeTool: ActiveTool = null;

  /** Files the user has "loaded" into the current tool. */
  private _files: File[] = [];

  /** Text buffers for text tools. */
  private _textInput = '';
  private _textInput2 = '';

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  /** Select a tool — equivalent to navigating to /image/resize etc. */
  selectTool(tool: ToolType): DriverResult<ToolType> {
    this.activeTool = tool;
    this._files = [];
    this._textInput = '';
    this._textInput2 = '';
    return ok(tool);
  }

  /** Get the category for the active tool. */
  get activeCategory(): ToolCategory | null {
    if (!this.activeTool) return null;
    const imageTools: ToolType[] = ['resize', 'compress', 'crop', 'convert', 'rotate'];
    const pdfTools: ToolType[] = ['merge', 'split', 'compress', 'image-to-pdf', 'pdf-to-image'];
    const mediaTools: ToolType[] = ['video-compress', 'video-to-gif', 'audio-extract', 'audio-convert'];
    const textTools: ToolType[] = ['word-count', 'case-convert', 'text-compare'];
    if (imageTools.includes(this.activeTool)) return 'image';
    if (pdfTools.includes(this.activeTool)) return 'pdf';
    if (mediaTools.includes(this.activeTool)) return 'media';
    if (textTools.includes(this.activeTool)) return 'text';
    return null;
  }

  /** Reset driver to initial state. */
  reset(): void {
    this.activeTool = null;
    this._files = [];
    this._textInput = '';
    this._textInput2 = '';
  }

  // -----------------------------------------------------------------------
  // File management
  // -----------------------------------------------------------------------

  /** Load files into the current tool (simulates drop / file-picker). */
  loadFiles(files: File[]): DriverResult<number> {
    if (!this.activeTool) return fail('No tool selected');
    if (files.length === 0) return fail('No files provided');
    this._files = files;
    return ok(files.length);
  }

  /** Load a single file (convenience wrapper). */
  loadFile(file: File): DriverResult<number> {
    return this.loadFiles([file]);
  }

  get files(): readonly File[] {
    return this._files;
  }

  // -----------------------------------------------------------------------
  // Text input
  // -----------------------------------------------------------------------

  /** Set primary text input (for word-count, case-convert, text-compare). */
  setText(text: string): DriverResult<number> {
    this._textInput = text;
    return ok(text.length);
  }

  /** Set secondary text input (for text-compare). */
  setText2(text: string): DriverResult<number> {
    this._textInput2 = text;
    return ok(text.length);
  }

  get textInput(): string {
    return this._textInput;
  }

  get textInput2(): string {
    return this._textInput2;
  }

  // -----------------------------------------------------------------------
  // TEXT TOOLS
  // -----------------------------------------------------------------------

  /** Count words / characters / sentences etc. */
  countWords(): DriverResult<WordCountData> {
    if (this.activeTool !== 'word-count') return fail('Select word-count tool first');
    if (!this._textInput) return fail('No text input provided');
    const result = textService.wordCount(this._textInput);
    return ok(result);
  }

  /** Convert case of the primary text input. */
  convertCase(
    caseType: 'upper' | 'lower' | 'title' | 'sentence' | 'toggle',
  ): DriverResult<string> {
    if (this.activeTool !== 'case-convert') return fail('Select case-convert tool first');
    if (!this._textInput) return fail('No text input provided');
    const result = textService.convertCase(this._textInput, caseType);
    return ok(result);
  }

  /** Compare two texts (line-by-line diff). */
  compareTexts(): DriverResult<DiffLine[]> {
    if (this.activeTool !== 'text-compare') return fail('Select text-compare tool first');
    if (!this._textInput && !this._textInput2) return fail('Provide at least one text input');
    const result = textService.compareTexts(this._textInput, this._textInput2);
    return ok(result);
  }

  // -----------------------------------------------------------------------
  // IMAGE TOOLS
  // -----------------------------------------------------------------------

  private _requireImageFile(): DriverResult<never> | null {
    if (this._files.length === 0) return fail('No image file loaded');
    const v = validateBeforeProcess(this._files[0], 'image', {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    if (!v.valid) return fail(v.error!);
    return null;
  }

  /** Resize the loaded image. */
  async resizeImage(options: ImageResizeOptions): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'resize') return fail('Select resize tool first');
    const err = this._requireImageFile();
    if (err) return err;
    const wv = validateNumber(options.width, 1, 7680, 'Width');
    if (!wv.valid) return fail(wv.error!);
    const hv = validateNumber(options.height, 1, 7680, 'Height');
    if (!hv.valid) return fail(hv.error!);
    try {
      const blob = await imageService.resize(this._files[0], options);
      return ok({ blob, originalSize: this._files[0].size, processedSize: blob.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Compress the loaded image. */
  async compressImage(options: ImageCompressOptions): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'compress') return fail('Select compress tool first');
    const err = this._requireImageFile();
    if (err) return err;
    const qv = validateNumber(options.quality, 0, 100, 'Quality');
    if (!qv.valid) return fail(qv.error!);
    try {
      const blob = await imageService.compress(this._files[0], options);
      return ok({ blob, originalSize: this._files[0].size, processedSize: blob.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Convert the loaded image to a different format. */
  async convertImage(options: ImageConvertOptions): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'convert') return fail('Select convert tool first');
    const err = this._requireImageFile();
    if (err) return err;
    try {
      const blob = await imageService.convert(this._files[0], options);
      return ok({ blob, originalSize: this._files[0].size, processedSize: blob.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Rotate / flip the loaded image. */
  async rotateImage(options: ImageRotateOptions): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'rotate') return fail('Select rotate tool first');
    const err = this._requireImageFile();
    if (err) return err;
    try {
      const blob = await imageService.rotate(this._files[0], options);
      return ok({ blob, originalSize: this._files[0].size, processedSize: blob.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Crop the loaded image. */
  async cropImage(area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'crop') return fail('Select crop tool first');
    const err = this._requireImageFile();
    if (err) return err;
    if (area.width <= 0 || area.height <= 0) return fail('Crop area must have positive dimensions');
    try {
      const blob = await imageService.crop(this._files[0], area);
      return ok({ blob, originalSize: this._files[0].size, processedSize: blob.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  // -----------------------------------------------------------------------
  // PDF TOOLS
  // -----------------------------------------------------------------------

  private _requirePdfFile(): DriverResult<never> | null {
    if (this._files.length === 0) return fail('No PDF file loaded');
    const v = validateBeforeProcess(this._files[0], 'pdf', {
      allowedTypes: ['application/pdf'],
    });
    if (!v.valid) return fail(v.error!);
    return null;
  }

  private _requirePdfFiles(): DriverResult<never> | null {
    if (this._files.length < 2) return fail('At least 2 PDF files required for merge');
    const v = validateBatchBeforeProcess(this._files, 'pdf', {
      allowedTypes: ['application/pdf'],
      maxFiles: 20,
    });
    if (!v.valid) return fail(v.error!);
    return null;
  }

  /** Merge loaded PDF files. */
  async mergePdfs(): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'merge') return fail('Select merge tool first');
    const err = this._requirePdfFiles();
    if (err) return err;
    try {
      const blobs = this._files.map((f) => f as Blob);
      const merged = await pdfService.merge(blobs);
      const totalOriginal = this._files.reduce((s, f) => s + f.size, 0);
      return ok({ blob: merged, originalSize: totalOriginal, processedSize: merged.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Split a PDF — extract specific pages. */
  async splitPdf(pageNumbers: number[]): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'split') return fail('Select split tool first');
    const err = this._requirePdfFile();
    if (err) return err;
    if (pageNumbers.length === 0) return fail('Specify at least one page number');
    try {
      const result = await pdfService.split(this._files[0], pageNumbers);
      return ok({ blob: result, originalSize: this._files[0].size, processedSize: result.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Split a PDF into individual pages. */
  async splitPdfAll(): Promise<DriverResult<Blob[]>> {
    if (this.activeTool !== 'split') return fail('Select split tool first');
    const err = this._requirePdfFile();
    if (err) return err;
    try {
      const pages = await pdfService.splitAll(this._files[0]);
      return ok(pages);
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Compress a PDF. */
  async compressPdf(): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'compress') {
      // "compress" is overloaded between image and pdf categories
      if (this.activeCategory !== 'pdf') return fail('Select PDF compress tool first');
    }
    const err = this._requirePdfFile();
    if (err) return err;
    try {
      const result = await pdfService.compress(this._files[0]);
      return ok({ blob: result, originalSize: this._files[0].size, processedSize: result.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Convert images to a single PDF. */
  async imagesToPdf(): Promise<DriverResult<BlobResult>> {
    if (this.activeTool !== 'image-to-pdf') return fail('Select image-to-pdf tool first');
    if (this._files.length === 0) return fail('No image files loaded');
    const v = validateBatchBeforeProcess(this._files, 'image', {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFiles: 50,
    });
    if (!v.valid) return fail(v.error!);
    try {
      const blobs = this._files.map((f) => f as Blob);
      const pdf = await pdfService.imagesToPdf(blobs);
      const totalOriginal = this._files.reduce((s, f) => s + f.size, 0);
      return ok({ blob: pdf, originalSize: totalOriginal, processedSize: pdf.size });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Convert a PDF to images. */
  async pdfToImages(options?: {
    scale?: number;
    format?: 'png' | 'jpeg';
  }): Promise<DriverResult<Blob[]>> {
    if (this.activeTool !== 'pdf-to-image') return fail('Select pdf-to-image tool first');
    const err = this._requirePdfFile();
    if (err) return err;
    try {
      const images = await pdfService.pdfToImages(this._files[0], options);
      return ok(images);
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  // -----------------------------------------------------------------------
  // MEDIA TOOLS
  // -----------------------------------------------------------------------

  /** Convert audio file format. */
  async convertAudio(
    options: AudioConvertOptions,
    onProgress?: (p: number) => void,
  ): Promise<DriverResult<MediaResult>> {
    if (this.activeTool !== 'audio-convert') return fail('Select audio-convert tool first');
    if (this._files.length === 0) return fail('No audio file loaded');
    const v = validateBeforeProcess(this._files[0], 'audio');
    if (!v.valid) return fail(v.error!);
    try {
      const result = await mediaService.convertAudio(this._files[0], options, onProgress);
      return ok({
        blob: result.blob,
        originalSize: result.originalSize,
        processedSize: result.processedSize,
        duration: result.duration,
      });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Compress a video file. */
  async compressVideo(
    options: VideoCompressOptions,
    onProgress?: (p: number) => void,
  ): Promise<DriverResult<MediaResult>> {
    if (this.activeTool !== 'video-compress') return fail('Select video-compress tool first');
    if (this._files.length === 0) return fail('No video file loaded');
    const v = validateBeforeProcess(this._files[0], 'video');
    if (!v.valid) return fail(v.error!);
    try {
      const result = await mediaService.compressVideo(this._files[0], options, onProgress);
      return ok({
        blob: result.blob,
        originalSize: result.originalSize,
        processedSize: result.processedSize,
        duration: result.duration,
      });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Convert a video clip to GIF. */
  async videoToGif(
    options: VideoToGifOptions,
    onProgress?: (p: number) => void,
  ): Promise<DriverResult<MediaResult>> {
    if (this.activeTool !== 'video-to-gif') return fail('Select video-to-gif tool first');
    if (this._files.length === 0) return fail('No video file loaded');
    if (options.startTime >= options.endTime) return fail('Start time must be before end time');
    const v = validateBeforeProcess(this._files[0], 'video');
    if (!v.valid) return fail(v.error!);
    try {
      const result = await mediaService.videoToGif(this._files[0], options, onProgress);
      return ok({
        blob: result.blob,
        originalSize: result.originalSize,
        processedSize: result.processedSize,
        duration: result.duration,
      });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  /** Extract audio track from a video file. */
  async extractAudio(
    options: ExtractAudioOptions,
    onProgress?: (p: number) => void,
  ): Promise<DriverResult<MediaResult>> {
    if (this.activeTool !== 'audio-extract') return fail('Select audio-extract tool first');
    if (this._files.length === 0) return fail('No video file loaded');
    const v = validateBeforeProcess(this._files[0], 'video');
    if (!v.valid) return fail(v.error!);
    try {
      const result = await mediaService.extractAudio(this._files[0], options, onProgress);
      return ok({
        blob: result.blob,
        originalSize: result.originalSize,
        processedSize: result.processedSize,
        duration: result.duration,
      });
    } catch (e: unknown) {
      return fail((e as Error).message);
    }
  }

  // -----------------------------------------------------------------------
  // Cross-tool convenience: chained operations
  // -----------------------------------------------------------------------

  /**
   * Process a file through multiple image operations in sequence.
   * Returns the final blob after all steps complete.
   */
  async chainImageOps(
    file: File,
    steps: Array<
      | { op: 'resize'; options: ImageResizeOptions }
      | { op: 'compress'; options: ImageCompressOptions }
      | { op: 'convert'; options: ImageConvertOptions }
      | { op: 'rotate'; options: ImageRotateOptions }
    >,
  ): Promise<DriverResult<BlobResult>> {
    let currentBlob: Blob = file;
    const originalSize = file.size;

    for (const step of steps) {
      try {
        switch (step.op) {
          case 'resize':
            currentBlob = await imageService.resize(currentBlob, step.options);
            break;
          case 'compress':
            currentBlob = await imageService.compress(currentBlob, step.options);
            break;
          case 'convert':
            currentBlob = await imageService.convert(currentBlob, step.options);
            break;
          case 'rotate':
            currentBlob = await imageService.rotate(currentBlob, step.options);
            break;
        }
      } catch (e: unknown) {
        return fail(`Step "${step.op}" failed: ${(e as Error).message}`);
      }
    }

    return ok({ blob: currentBlob, originalSize, processedSize: currentBlob.size });
  }
}
