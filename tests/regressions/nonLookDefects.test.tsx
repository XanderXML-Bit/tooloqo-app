// Regression tests for the 2026-11 audit defects (Tooloqo items 1, 2, 3 and 5).
// Each test failed on main at 4d31ccc before the fix.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  version: '5.4.449',
  getDocument: vi.fn(),
}));

vi.mock('@/services/imageService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/imageService')>();
  return {
    ...actual,
    imageService: {
      ...actual.imageService,
      getDimensions: vi.fn().mockResolvedValue({ width: 1600, height: 1000 }),
    },
  };
});

describe('item 1: the pdf.js worker ships with the app', () => {
  it('points workerSrc at the bundled worker, not a CDN', async () => {
    const pdfjs = await import('pdfjs-dist');
    await import('@/services/pdfService');
    const src = pdfjs.GlobalWorkerOptions.workerSrc;
    expect(src).toMatch(/pdf\.worker(\.min)?\.mjs/);
    // A protocol-relative or absolute URL would reach a third-party host.
    expect(src).not.toMatch(/^(https?:)?\/\//);
  });
});

describe('item 2 and 3: no recent-files or auto-cleanup feature is advertised', () => {
  beforeEach(() => localStorage.clear());

  it('Home shows no recent-files section or empty state', async () => {
    const { Home } = await import('@/pages/Home');
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.queryByText(/recent files/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/appear here for quick access/i)).not.toBeInTheDocument();
  });

  it('Settings shows no recent-files row or auto-cleanup switch', async () => {
    const { Settings } = await import('@/pages/Settings');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.queryByText(/recent files/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/files cached/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /auto-cleanup/i })).not.toBeInTheDocument();
  });

  it('the file store keeps no recent-files list', async () => {
    const { useFileStore } = await import('@/stores/fileStore');
    const state = useFileStore.getState() as unknown as Record<string, unknown>;
    expect(state.recentFiles).toBeUndefined();
    expect(state.addToRecent).toBeUndefined();
  });
});

describe('item 5: Image Resize starts at the source aspect ratio', () => {
  it('opens a 1600 x 1000 image at 1080 x 675', async () => {
    const { ImageResize } = await import('@/components/tools/image/ImageResize');
    render(<MemoryRouter><ImageResize /></MemoryRouter>);
    const input = screen.getByLabelText('Choose files to upload') as HTMLInputElement;
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'wide.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    const [width, height] = await screen.findAllByRole('spinbutton');
    await waitFor(() => expect(height).toHaveValue(675));
    expect(width).toHaveValue(1080);
  });
});
