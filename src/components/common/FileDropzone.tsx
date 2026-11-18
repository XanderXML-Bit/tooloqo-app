import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react';
import { File, X, AlertCircle, CloudUpload } from 'lucide-react';
import { cn, formatFileSize, generateId } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/lib/constants';
import type { TooloqoFile } from '@/types';
import type { CardCategory } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  onFilesSelected: (files: TooloqoFile[]) => void;
  acceptedMimeTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  className?: string;
  /** Tool category for themed colors */
  category?: CardCategory;
}

// Category color configurations
const categoryConfig: Record<NonNullable<CardCategory>, {
  borderActive: string;
  bgActive: string;
  iconBg: string;
  iconColor: string;
  glowShadow: string;
  accentColor: string;
}> = {
  image: {
    borderActive: 'border-blue-500',
    bgActive: 'bg-blue-500/10',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-500',
    glowShadow: 'shadow-[inset_0_0_24px_rgba(59,130,246,0.15)]',
    accentColor: 'border-blue-500',
  },
  pdf: {
    borderActive: 'border-red-500',
    bgActive: 'bg-red-500/10',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-500',
    glowShadow: 'shadow-[inset_0_0_24px_rgba(239,68,68,0.15)]',
    accentColor: 'border-red-500',
  },
  text: {
    borderActive: 'border-green-500',
    bgActive: 'bg-green-500/10',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-500',
    glowShadow: 'shadow-[inset_0_0_24px_rgba(34,197,94,0.15)]',
    accentColor: 'border-green-500',
  },
  media: {
    borderActive: 'border-purple-500',
    bgActive: 'bg-purple-500/10',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-500',
    glowShadow: 'shadow-[inset_0_0_24px_rgba(168,85,247,0.15)]',
    accentColor: 'border-purple-500',
  },
};

const defaultConfig = {
  borderActive: 'border-primary-500',
  bgActive: 'bg-primary-500/10',
  iconBg: 'bg-primary-500/20',
  iconColor: 'text-primary-500',
  glowShadow: 'shadow-[inset_0_0_24px_rgba(51,120,255,0.15)]',
  accentColor: 'border-primary-500',
};

/**
 * Corner accent component for drag state with category theming
 */
function CornerAccent({
  position,
  accentColor,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  accentColor: string;
}) {
  const positionClasses = {
    tl: 'top-3 left-3 border-t-2 border-l-2 rounded-tl-xl',
    tr: 'top-3 right-3 border-t-2 border-r-2 rounded-tr-xl',
    bl: 'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-xl',
    br: 'bottom-3 right-3 border-b-2 border-r-2 rounded-br-xl',
  };

  return (
    <div
      className={cn(
        'absolute w-5 h-5',
        'animate-bounce-in',
        accentColor,
        positionClasses[position]
      )}
    />
  );
}

export function FileDropzone({
  onFilesSelected,
  acceptedMimeTypes = ['*/*'],
  maxFiles = 20,
  maxFileSize = MAX_FILE_SIZE,
  className,
  category,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<TooloqoFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Get category-specific or default config
  const config = category ? categoryConfig[category] : defaultConfig;

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const newErrors: string[] = [];
      const validFiles: TooloqoFile[] = [];

      const filesToProcess = Array.from(fileList).slice(0, maxFiles - selectedFiles.length);

      if (fileList.length > maxFiles - selectedFiles.length) {
        newErrors.push(`Maximum ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'} allowed`);
      }

      for (const file of filesToProcess) {
        // Check file size
        if (file.size > maxFileSize) {
          newErrors.push(`${file.name}: File too large (max ${formatFileSize(maxFileSize)})`);
          continue;
        }

        // Check mime type
        const isAccepted =
          acceptedMimeTypes.includes('*/*') ||
          acceptedMimeTypes.some((type) => {
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', '/'));
            }
            return file.type === type;
          });

        if (!isAccepted) {
          newErrors.push(`${file.name}: File type not supported`);
          continue;
        }

        // Generate thumbnail for images
        let thumbnail: string | undefined;
        if (file.type.startsWith('image/')) {
          try {
            thumbnail = await generateThumbnail(file);
          } catch {
            // Thumbnail generation failed, continue without it
          }
        }

        validFiles.push({
          id: generateId(),
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          blob: file,
          thumbnail,
          createdAt: new Date(),
        });
      }

      setErrors(newErrors);

      if (validFiles.length > 0) {
        const newSelectedFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newSelectedFiles);
        onFilesSelected(newSelectedFiles);
      }
    },
    [selectedFiles, maxFiles, maxFileSize, acceptedMimeTypes, onFilesSelected]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      const newFiles = selectedFiles.filter((f) => f.id !== id);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, onFilesSelected]
  );

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setErrors([]);
    onFilesSelected([]);
  }, [onFilesSelected]);

  const acceptString = acceptedMimeTypes.join(',');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone with Precision Tools styling */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl p-8 text-center cursor-pointer',
          'border-2 border-dashed',
          'bg-surface-elevated/50',
          'transition-all duration-300',
          '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          isDragOver
            ? [config.borderActive, config.bgActive, config.glowShadow].join(' ')
            : [
                'border-border',
                `hover:${config.borderActive.replace('border-', 'border-')}/50`,
                'hover:bg-surface-elevated hover:shadow-lg',
              ].join(' ')
        )}
      >
        {/* Corner accents on drag */}
        {isDragOver && (
          <>
            <CornerAccent position="tl" accentColor={config.accentColor} />
            <CornerAccent position="tr" accentColor={config.accentColor} />
            <CornerAccent position="bl" accentColor={config.accentColor} />
            <CornerAccent position="br" accentColor={config.accentColor} />
          </>
        )}

        <input
          type="file"
          accept={acceptString}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Choose files to upload"
        />

        <div className="flex flex-col items-center gap-4">
          {/* Icon with category-aware glow */}
          <div
            className={cn(
              'p-4 rounded-2xl transition-all duration-300',
              '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
              isDragOver
                ? [config.iconBg, 'scale-110 shadow-lg'].join(' ')
                : 'bg-surface border border-border/50 hover:bg-surface-elevated'
            )}
          >
            <CloudUpload
              aria-hidden="true"
              className={cn(
                'h-10 w-10 transition-all duration-300',
                isDragOver ? [config.iconColor, 'stroke-[1.75]'].join(' ') : 'text-text-tertiary'
              )}
            />
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <p
              className={cn(
                'font-semibold tracking-tight transition-colors duration-200',
                isDragOver ? config.iconColor : 'text-text-primary'
              )}
            >
              {isDragOver ? 'Drop files here' : 'Drop files here or tap to browse'}
            </p>
            <p className="text-sm text-text-tertiary font-mono tabular-nums">
              Max {maxFiles} {maxFiles === 1 ? 'file' : 'files'} • {formatFileSize(maxFileSize)} each
            </p>
          </div>
        </div>
      </div>

      {/* Error messages with refined container */}
      {errors.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className={cn(
            'rounded-xl p-4 space-y-2',
            'bg-error/10 border border-error/20',
            'shadow-[0_0_16px_rgba(239,68,68,0.08)]',
            'animate-fade-in'
          )}
        >
          {errors.map((error, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 text-sm"
            >
              <div className="p-1 rounded-md bg-error/10">
                <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
              </div>
              <span className="font-medium text-error/90 leading-relaxed">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              <span className="font-mono text-primary-500">
                {selectedFiles.length}
              </span>{' '}
              file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-text-tertiary hover:text-error"
            >
              Clear all
            </Button>
          </div>

          {/* File list */}
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
            {selectedFiles.map((file, index) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'bg-surface-elevated border border-border/50',
                  'transition-all duration-200',
                  'hover:border-border hover:shadow-sm',
                  'animate-slide-up'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Thumbnail */}
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.originalName}
                    className="h-10 w-10 rounded-lg object-cover ring-1 ring-border/50"
                  />
                ) : (
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      'bg-surface border border-border/50'
                    )}
                  >
                    <File className="h-5 w-5 text-text-tertiary" />
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-text-tertiary font-mono">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-text-tertiary hover:text-error hover:bg-error/10"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remove ${file.originalName}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 100;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
