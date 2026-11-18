import { memo } from 'react';
import { File, X, Check } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TooloqoFile } from '@/types';

interface FilePreviewProps {
  file: TooloqoFile;
  onRemove?: () => void;
  showSize?: boolean;
  isProcessed?: boolean;
  originalSize?: number;
  className?: string;
}

/**
 * File preview with Industrial Premium styling
 * Features: thumbnail display, size info, processed state indicator
 */
export const FilePreview = memo(function FilePreview({
  file,
  onRemove,
  showSize = true,
  isProcessed = false,
  originalSize,
  className,
}: FilePreviewProps) {
  const isImage = file.mimeType.startsWith('image/');
  const savedPercentage =
    originalSize && file.size < originalSize
      ? Math.round((1 - file.size / originalSize) * 100)
      : null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-surface-elevated border border-border/50',
        'transition-all duration-200',
        isProcessed && 'ring-2 ring-success/30 border-success/30',
        className
      )}
    >
      {/* Thumbnail */}
      {isImage && file.thumbnail ? (
        <img
          src={file.thumbnail}
          alt={file.originalName}
          className="h-12 w-12 rounded-lg object-cover ring-1 ring-border/50"
        />
      ) : (
        <div
          className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            'bg-surface border border-border/50'
          )}
        >
          <File className="h-6 w-6 text-text-tertiary" />
        </div>
      )}

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {file.originalName}
        </p>
        {showSize && (
          <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono">
            <span>{formatFileSize(file.size)}</span>
            {savedPercentage !== null && savedPercentage > 0 && (
              <span className="text-success font-semibold">
                -{savedPercentage}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status/Actions */}
      {isProcessed ? (
        <div
          className={cn(
            'shrink-0 h-8 w-8 rounded-lg',
            'bg-success/10 flex items-center justify-center'
          )}
        >
          <Check className="h-4 w-4 text-success" />
        </div>
      ) : onRemove ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-text-tertiary hover:text-error hover:bg-error/10"
          onClick={onRemove}
          aria-label={`Remove ${file.originalName}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
});

interface FilePreviewGridProps {
  files: TooloqoFile[];
  onRemove?: (id: string) => void;
  processedFiles?: TooloqoFile[];
  originalSizes?: Map<string, number>;
  className?: string;
}

/**
 * Grid of file previews
 */
export function FilePreviewGrid({
  files,
  onRemove,
  processedFiles,
  originalSizes,
  className,
}: FilePreviewGridProps) {
  const processedIds = new Set(processedFiles?.map((f) => f.id) || []);

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file, index) => (
        <div
          key={file.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <FilePreview
            file={processedFiles?.find((p) => p.id === file.id) || file}
            onRemove={onRemove ? () => onRemove(file.id) : undefined}
            isProcessed={processedIds.has(file.id)}
            originalSize={originalSizes?.get(file.id)}
          />
        </div>
      ))}
    </div>
  );
}
