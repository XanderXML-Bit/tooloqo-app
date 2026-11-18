/**
 * Tooloqo AppBridge — Singleton programmatic interface for AI agents.
 *
 * Exposes all user-facing actions: file management, tool execution,
 * settings, navigation. Wraps the existing services.
 */

import { imageService } from '@/services/imageService';
import { pdfService } from '@/services/pdfService';
import { textService } from '@/services/textService';
import type {
  TooloqoFile,
  ToolType,
  AppSettings,
  ImageResizeOptions,
  ImageCompressOptions,
  ImageConvertOptions,
  ImageRotateOptions,
} from '@/types';
import { StateInspector } from './StateInspector';
import { ActionRecorder } from './ActionRecorder';

interface BridgeResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function ok<T>(data: T): BridgeResult<T> { return { ok: true, data }; }
function fail(error: string): BridgeResult<never> { return { ok: false, error }; }

type ActivePage = 'home' | 'image-tools' | 'pdf-tools' | 'media-tools' | 'text-tools' | 'settings' | 'ad-free';

export class AppBridge {
  private static instance: AppBridge;
  readonly inspector: StateInspector;
  readonly recorder: ActionRecorder;

  private _currentPage: ActivePage = 'home';
  private _activeTool: ToolType | null = null;
  private _loadedFiles: TooloqoFile[] = [];

  private constructor() {
    this.inspector = new StateInspector();
    this.recorder = new ActionRecorder();
  }

  static getInstance(): AppBridge {
    if (!AppBridge.instance) {
      AppBridge.instance = new AppBridge();
    }
    return AppBridge.instance;
  }

  // =========================================================================
  // Navigation
  // =========================================================================

  get currentPage(): ActivePage { return this._currentPage; }
  get activeTool(): ToolType | null { return this._activeTool; }

  navigate(page: ActivePage): BridgeResult<ActivePage> {
    this._currentPage = page;
    this._activeTool = null;
    this.recorder.record('navigate', { page }, { ok: true });
    return ok(page);
  }

  selectTool(tool: ToolType): BridgeResult<ToolType> {
    this._activeTool = tool;
    this.recorder.record('selectTool', { tool }, { ok: true });
    return ok(tool);
  }

  // =========================================================================
  // File management
  // =========================================================================

  loadFiles(files: TooloqoFile[]): BridgeResult<TooloqoFile[]> {
    this._loadedFiles = [...this._loadedFiles, ...files];
    this.recorder.record('loadFiles', { count: files.length }, { ok: true });
    return ok(this._loadedFiles);
  }

  clearFiles(): BridgeResult<void> {
    this._loadedFiles = [];
    this.recorder.record('clearFiles', {}, { ok: true });
    return ok(undefined);
  }

  getLoadedFiles(): TooloqoFile[] {
    return [...this._loadedFiles];
  }

  // =========================================================================
  // Text tools (synchronous, no file I/O needed)
  // =========================================================================

  wordCount(text: string): BridgeResult<{
    characters: number;
    words: number;
    sentences: number;
    paragraphs: number;
  }> {
    try {
      const result = textService.wordCount(text);
      this.recorder.record('wordCount', { length: text.length }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  caseConvert(text: string, targetCase: 'upper' | 'lower' | 'title' | 'sentence' | 'toggle'): BridgeResult<string> {
    try {
      const result = textService.convertCase(text, targetCase);
      this.recorder.record('caseConvert', { targetCase }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  textCompare(textA: string, textB: string): BridgeResult<Array<{ type: string; value: string }>> {
    try {
      const result = textService.compareTexts(textA, textB);
      this.recorder.record('textCompare', {}, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  // =========================================================================
  // Image tools (need Blob input)
  // =========================================================================

  async imageResize(file: Blob, options: ImageResizeOptions): Promise<BridgeResult<Blob>> {
    try {
      const result = await imageService.resize(file, options);
      this.recorder.record('imageResize', { options }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  async imageCompress(file: Blob, options: ImageCompressOptions): Promise<BridgeResult<Blob>> {
    try {
      const result = await imageService.compress(file, options);
      this.recorder.record('imageCompress', { options }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  async imageConvert(file: Blob, options: ImageConvertOptions): Promise<BridgeResult<Blob>> {
    try {
      const result = await imageService.convert(file, options);
      this.recorder.record('imageConvert', { options }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  async imageRotate(file: Blob, options: ImageRotateOptions): Promise<BridgeResult<Blob>> {
    try {
      const result = await imageService.rotate(file, options);
      this.recorder.record('imageRotate', { options }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  // =========================================================================
  // PDF tools
  // =========================================================================

  async pdfMerge(files: Blob[]): Promise<BridgeResult<Blob>> {
    try {
      const result = await pdfService.merge(files);
      this.recorder.record('pdfMerge', { fileCount: files.length }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  async pdfSplit(file: Blob, pageNumbers: number[]): Promise<BridgeResult<Blob>> {
    try {
      const result = await pdfService.split(file, pageNumbers);
      this.recorder.record('pdfSplit', { pageNumbers }, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  async pdfCompress(file: Blob): Promise<BridgeResult<Blob>> {
    try {
      const result = await pdfService.compress(file);
      this.recorder.record('pdfCompress', {}, { ok: true });
      return ok(result);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e));
    }
  }

  // =========================================================================
  // Settings
  // =========================================================================

  getSettings(): AppSettings | null {
    return this.inspector.getSettings();
  }

  // =========================================================================
  // State access
  // =========================================================================

  getState() {
    return {
      ...this.inspector.getFullState(),
      currentPage: this._currentPage,
      activeTool: this._activeTool,
      loadedFiles: this._loadedFiles.length,
    };
  }

  getActionHistory() {
    return this.recorder.getHistory();
  }
}
