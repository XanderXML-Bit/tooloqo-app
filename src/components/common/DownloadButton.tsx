import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Download, Share2, Check } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { downloadBlob, formatFileSize, cn } from '@/lib/utils';
import type { TooloqoFile } from '@/types';
import type { CardCategory } from '@/components/ui/card';

interface DownloadButtonProps {
  file: TooloqoFile;
  variant?: ButtonProps['variant'];
  showSize?: boolean;
  className?: string;
  /** Tool category for themed colors */
  category?: CardCategory;
}

// Map card categories to button variants
const categoryToVariant: Record<NonNullable<CardCategory>, ButtonProps['variant']> = {
  image: 'image',
  pdf: 'pdf',
  text: 'text',
  media: 'media',
};

/**
 * Download button with share option and success feedback
 * Uses Web Share API when available
 */
export function DownloadButton({
  file,
  variant,
  showSize = true,
  className,
  category,
}: DownloadButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => { clearTimeout(successTimerRef.current); };
  }, []);

  // Determine button variant: explicit > category > default
  const buttonVariant = variant || (category ? categoryToVariant[category] : 'default');

  const handleDownload = useCallback(() => {
    downloadBlob(file.blob, file.originalName);
    setIsSuccess(true);
    clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setIsSuccess(false), 2000);
  }, [file.blob, file.originalName]);

  const handleShare = async () => {
    const shareFile = new File([file.blob], file.originalName, {
      type: file.mimeType,
    });
    const shareData = { files: [shareFile] };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or share failed, fallback to download
        if ((error as Error).name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      handleDownload();
    }
  };

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className={cn('flex gap-2', className)}>
      <Button
        variant={isSuccess ? 'success' : buttonVariant}
        onClick={handleDownload}
        className={cn(
          'flex-1 transition-all duration-200',
          isSuccess && 'shadow-glow-success'
        )}
      >
        {isSuccess ? (
          <Check className="h-4 w-4 mr-2 animate-bounce-in" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isSuccess ? 'Downloaded!' : 'Download'}
        {showSize && !isSuccess && (
          <span className="ml-2 text-xs opacity-70 font-mono tabular-nums">
            ({formatFileSize(file.size)})
          </span>
        )}
      </Button>

      {canShare && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleShare}
          className="shrink-0"
          aria-label="Share file"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

interface DownloadAllButtonProps {
  files: TooloqoFile[];
  className?: string;
  /** Tool category for themed colors */
  category?: CardCategory;
}

/**
 * Download all files button with success feedback
 * Staggers downloads to prevent browser blocking
 */
export function DownloadAllButton({
  files,
  className,
  category,
}: DownloadAllButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  // Determine button variant based on category
  const buttonVariant = category ? categoryToVariant[category] : 'default';

  const handleDownloadAll = useCallback(() => {
    setIsDownloading(true);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    files.forEach((file, index) => {
      // Stagger downloads to prevent browser blocking
      const timer = setTimeout(() => {
        downloadBlob(file.blob, file.originalName);

        // Show success after last file
        if (index === files.length - 1) {
          setIsDownloading(false);
          setIsSuccess(true);
          const successTimer = setTimeout(() => setIsSuccess(false), 2000);
          timersRef.current.push(successTimer);
        }
      }, index * 200);
      timersRef.current.push(timer);
    });
  }, [files]);

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);

  return (
    <Button
      variant={isSuccess ? 'success' : buttonVariant}
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className={cn(
        'transition-all duration-200',
        isSuccess && 'shadow-glow-success',
        className
      )}
    >
      {isSuccess ? (
        <Check className="h-4 w-4 mr-2 animate-bounce-in" />
      ) : (
        <Download className={cn('h-4 w-4 mr-2', isDownloading && 'animate-bounce')} />
      )}
      {isSuccess
        ? 'All Downloaded!'
        : isDownloading
          ? 'Downloading...'
          : 'Download All'}
      {!isSuccess && !isDownloading && (
        <span className="ml-2 font-mono text-xs opacity-70 tabular-nums">
          ({files.length} files, {formatFileSize(totalSize)})
        </span>
      )}
    </Button>
  );
}
