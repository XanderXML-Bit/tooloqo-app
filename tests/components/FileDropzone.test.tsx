import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileDropzone } from '@/components/common/FileDropzone';

// Helper to create a mock File
function createMockFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(Math.min(size, 100));
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

// Helper to create a mock FileList (DataTransfer not available in jsdom)
function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) yield file;
    },
  } as unknown as FileList;
  // Index access
  files.forEach((f, i) => {
    Object.defineProperty(fileList, i, { value: f, enumerable: true });
  });
  return fileList;
}

describe('FileDropzone', () => {
  const defaultProps = {
    onFilesSelected: vi.fn(),
  };

  it('renders the dropzone with upload prompt', () => {
    render(<FileDropzone {...defaultProps} />);
    expect(screen.getByText('Drop files here or tap to browse')).toBeInTheDocument();
  });

  it('renders file input with aria-label', () => {
    render(<FileDropzone {...defaultProps} />);
    const input = screen.getByLabelText('Choose files to upload');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
  });

  it('shows max files and size info', () => {
    render(<FileDropzone {...defaultProps} maxFiles={5} />);
    expect(screen.getByText(/Max 5 files/)).toBeInTheDocument();
  });

  it('allows multiple files when maxFiles > 1', () => {
    render(<FileDropzone {...defaultProps} maxFiles={10} />);
    const input = screen.getByLabelText('Choose files to upload');
    expect(input).toHaveAttribute('multiple');
  });

  it('disallows multiple files when maxFiles = 1', () => {
    render(<FileDropzone {...defaultProps} maxFiles={1} />);
    const input = screen.getByLabelText('Choose files to upload');
    expect(input).not.toHaveAttribute('multiple');
  });

  it('sets accept attribute from acceptedMimeTypes', () => {
    render(
      <FileDropzone
        {...defaultProps}
        acceptedMimeTypes={['image/png', 'image/jpeg']}
      />
    );
    const input = screen.getByLabelText('Choose files to upload');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg');
  });

  describe('file selection via input', () => {
    it('calls onFilesSelected when files are chosen', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('test.txt', 100, 'text/plain');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledTimes(1);
      });

      const calledWith = onFilesSelected.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0].originalName).toBe('test.txt');
    });

    it('handles multiple files', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
          maxFiles={5}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const files = [
        createMockFile('file1.txt', 100, 'text/plain'),
        createMockFile('file2.txt', 200, 'text/plain'),
      ];

      fireEvent.change(input, { target: { files: createFileList(files) } });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledTimes(1);
      });

      const calledWith = onFilesSelected.mock.calls[0][0];
      expect(calledWith).toHaveLength(2);
    });
  });

  describe('MIME type validation', () => {
    it('rejects files with unsupported MIME types', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['image/png']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('doc.pdf', 100, 'application/pdf');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/doc.pdf: File type not supported/)).toBeInTheDocument();
      expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it('accepts wildcard MIME types', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['image/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('photo.png', 100, 'image/png');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledTimes(1);
      });
    });

    it('accepts all types with */*', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('anything.xyz', 100, 'application/octet-stream');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('file size validation', () => {
    it('rejects files that exceed maxFileSize', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          maxFileSize={1000}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('large.txt', 2000, 'text/plain');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/large.txt: File too large/)).toBeInTheDocument();
      expect(onFilesSelected).not.toHaveBeenCalled();
    });
  });

  describe('max files limit', () => {
    it('shows error when too many files are selected', async () => {
      render(
        <FileDropzone
          onFilesSelected={vi.fn()}
          maxFiles={1}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const files = [
        createMockFile('a.txt', 100, 'text/plain'),
        createMockFile('b.txt', 100, 'text/plain'),
      ];

      fireEvent.change(input, { target: { files: createFileList(files) } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/Maximum 1 file allowed/)).toBeInTheDocument();
      expect(screen.getByText(/Max 1 file •/)).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('shows drag-over state on dragOver', () => {
      render(<FileDropzone {...defaultProps} />);

      const dropzone = screen.getByText('Drop files here or tap to browse').closest('div[class*="border-dashed"]')!;

      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText('Drop files here')).toBeInTheDocument();
    });

    it('removes drag-over state on dragLeave', () => {
      render(<FileDropzone {...defaultProps} />);

      const dropzone = screen.getByText('Drop files here or tap to browse').closest('div[class*="border-dashed"]')!;

      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText('Drop files here')).toBeInTheDocument();

      fireEvent.dragLeave(dropzone, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText('Drop files here or tap to browse')).toBeInTheDocument();
    });

    it('processes files on drop', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
        />
      );

      const dropzone = screen.getByText('Drop files here or tap to browse').closest('div[class*="border-dashed"]')!;
      const file = createMockFile('dropped.txt', 100, 'text/plain');

      fireEvent.drop(dropzone, {
        dataTransfer: { files: createFileList([file]) },
      });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledTimes(1);
      });

      const calledWith = onFilesSelected.mock.calls[0][0];
      expect(calledWith[0].originalName).toBe('dropped.txt');
    });
  });

  describe('file list and removal', () => {
    it('shows selected files list after selection', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('myfile.txt', 1024, 'text/plain');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(screen.getByText('myfile.txt')).toBeInTheDocument();
      });

      expect(screen.getByText(/file selected/)).toBeInTheDocument();
    });

    it('shows remove button for each file', async () => {
      render(
        <FileDropzone
          onFilesSelected={vi.fn()}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('removable.txt', 100, 'text/plain');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(screen.getByLabelText('Remove removable.txt')).toBeInTheDocument();
      });
    });

    it('removes a file when remove button is clicked', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('toremove.txt', 100, 'text/plain');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        expect(screen.getByText('toremove.txt')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Remove toremove.txt'));

      await waitFor(() => {
        expect(screen.queryByText('toremove.txt')).not.toBeInTheDocument();
      });

      // Should be called twice: once for add, once for remove (empty array)
      expect(onFilesSelected).toHaveBeenCalledTimes(2);
    });

    it('clears all files when Clear all is clicked', async () => {
      const onFilesSelected = vi.fn();
      render(
        <FileDropzone
          onFilesSelected={onFilesSelected}
          acceptedMimeTypes={['*/*']}
          maxFiles={5}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const files = [
        createMockFile('a.txt', 100, 'text/plain'),
        createMockFile('b.txt', 100, 'text/plain'),
      ];

      fireEvent.change(input, { target: { files: createFileList(files) } });

      await waitFor(() => {
        expect(screen.getByText('a.txt')).toBeInTheDocument();
        expect(screen.getByText('b.txt')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Clear all'));

      await waitFor(() => {
        expect(screen.queryByText('a.txt')).not.toBeInTheDocument();
        expect(screen.queryByText('b.txt')).not.toBeInTheDocument();
      });
    });
  });

  describe('category theming', () => {
    it('renders with image category', () => {
      const { container } = render(
        <FileDropzone {...defaultProps} category="image" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('renders with pdf category', () => {
      const { container } = render(
        <FileDropzone {...defaultProps} category="pdf" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('renders without category', () => {
      const { container } = render(
        <FileDropzone {...defaultProps} />
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('error display', () => {
    it('displays errors with role="alert"', async () => {
      render(
        <FileDropzone
          onFilesSelected={vi.fn()}
          acceptedMimeTypes={['image/png']}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const file = createMockFile('bad.exe', 100, 'application/x-msdownload');

      fireEvent.change(input, { target: { files: createFileList([file]) } });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });
    });

    it('displays multiple errors for multiple invalid files', async () => {
      render(
        <FileDropzone
          onFilesSelected={vi.fn()}
          acceptedMimeTypes={['image/png']}
          maxFileSize={100}
        />
      );

      const input = screen.getByLabelText('Choose files to upload');
      const files = [
        createMockFile('wrong-type.txt', 50, 'text/plain'),
        createMockFile('too-big.png', 200, 'image/png'),
      ];

      fireEvent.change(input, { target: { files: createFileList(files) } });

      await waitFor(() => {
        expect(screen.getByText(/wrong-type.txt: File type not supported/)).toBeInTheDocument();
        expect(screen.getByText(/too-big.png: File too large/)).toBeInTheDocument();
      });
    });
  });
});
