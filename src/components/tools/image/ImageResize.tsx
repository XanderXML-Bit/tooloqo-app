import { useState, useCallback, useEffect } from 'react';
import { Maximize2, Link2, Link2Off, Check, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { FilePreview } from '@/components/common/FilePreview';
import { DownloadButton, DownloadAllButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { imageService } from '@/services/imageService';
import { feedback } from '@/services/feedbackService';
import { IMAGE_RESIZE_PRESETS } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import { getStaggerDelay } from '@/lib/animations';
import type { TooloqoFile, ImageResizeOptions } from '@/types';

type PresetId = (typeof IMAGE_RESIZE_PRESETS)[number]['id'] | 'custom';

/** Width the fields start at. The height follows the source image's shape. */
const DEFAULT_WIDTH = 1080;

function heightForWidth(width: number, source: { width: number; height: number }) {
  return Math.max(1, Math.round((width * source.height) / source.width));
}

export function ImageResize() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<PresetId>('custom');
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_WIDTH);
  const [resultLabel, setResultLabel] = useState('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (files.length > 0 && !originalDimensions) {
      imageService.getDimensions(files[0].blob).then((dims) => {
        setOriginalDimensions(dims);
        // Start at the source shape, so the fields match the file that comes out.
        setSelectedPreset('custom');
        setWidth(DEFAULT_WIDTH);
        setHeight(heightForWidth(DEFAULT_WIDTH, dims));
      });
    }
  }, [files, originalDimensions]);

  useEffect(() => {
    if (selectedPreset !== 'custom') {
      const preset = IMAGE_RESIZE_PRESETS.find((p) => p.id === selectedPreset);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
      }
    }
  }, [selectedPreset]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    setSelectedPreset('custom');
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    setSelectedPreset('custom');
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFiles([]);
    setError(null);
    setOriginalDimensions(null);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;

    if (width < 1 || width > 10000) {
      setError('Width must be between 1 and 10,000 pixels');
      return;
    }
    if (height < 1 || height > 10000) {
      setError('Height must be between 1 and 10,000 pixels');
      return;
    }

    feedback.tap();
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProcessedFiles([]);

    const options: ImageResizeOptions = { width, height, maintainAspectRatio };
    const results: TooloqoFile[] = [];
    const sizes = new Set<string>();

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const resizedBlob = await imageService.resize(file.blob, options);
        const thumbnail = await imageService.generateThumbnail(resizedBlob);
        // With Linked on, the image fits inside the box, so name it by its real size.
        const out = await imageService.getDimensions(resizedBlob);
        sizes.add(`${out.width} × ${out.height}`);

        results.push({
          id: generateId(),
          originalName: file.originalName.replace(/(\.[^.]+)$/, `_${out.width}x${out.height}$1`),
          mimeType: resizedBlob.type,
          size: resizedBlob.size,
          blob: resizedBlob,
          thumbnail,
          createdAt: new Date(),
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      setResultLabel(
        sizes.size === 1 ? `Resized to ${[...sizes][0]}` : `Resized to fit within ${width} × ${height}`
      );
      setProcessedFiles(results);
      feedback.success();
    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedFiles([]);
    setError(null);
    setOriginalDimensions(null);
  };

  return (
    <Layout title="Image Resize" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="image"
          icon={Maximize2}
          title="Resize Image"
          description="Change dimensions for any platform"
        />

        {/* File Selection */}
        {files.length === 0 && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
            maxFiles={20}
            category="image"
          />
        )}

        {/* Options */}
        {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
          <>
            {/* Presets */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="image">Presets</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_RESIZE_PRESETS.slice(0, 6).map((preset) => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset === preset.id ? 'image' : 'secondary'}
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => setSelectedPreset(preset.id)}
                    >
                      {selectedPreset === preset.id && <Check className="h-3 w-3 mr-1" />}
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Dimensions */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tool-image" />
                    Dimensions
                  </h3>
                  <Button
                    variant={maintainAspectRatio ? 'image' : 'secondary'}
                    size="sm"
                    aria-pressed={maintainAspectRatio}
                    onClick={() => {
                      const linking = !maintainAspectRatio;
                      setMaintainAspectRatio(linking);
                      // Turning the link on snaps the height back to the source shape.
                      if (linking && originalDimensions) {
                        setSelectedPreset('custom');
                        setHeight(heightForWidth(width, originalDimensions));
                      }
                    }}
                    className="gap-1.5"
                  >
                    {maintainAspectRatio ? (
                      <Link2 className="h-3.5 w-3.5" />
                    ) : (
                      <Link2Off className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs">{maintainAspectRatio ? 'Linked' : 'Free'}</span>
                  </Button>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label htmlFor="resize-width" className="text-xs text-text-tertiary mb-1.5 block font-medium">
                      Width (px)
                    </label>
                    <Input
                      id="resize-width"
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      min={1}
                      max={10000}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="resize-height" className="text-xs text-text-tertiary mb-1.5 block font-medium">
                      Height (px)
                    </label>
                    <Input
                      id="resize-height"
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      min={1}
                      max={10000}
                    />
                  </div>
                </div>

                {(width < 1 || width > 10000 || height < 1 || height > 10000) && (
                  <p className="text-xs text-error font-medium">
                    Dimensions must be between 1 and 10,000 pixels
                  </p>
                )}

                {originalDimensions && (
                  <p className="text-xs text-text-tertiary font-mono tabular-nums">
                    Original: {originalDimensions.width} × {originalDimensions.height}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Files */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    <span className="font-mono text-tool-image">{files.length}</span> file{files.length > 1 ? 's' : ''} selected
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Clear
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file) => (
                    <FilePreview
                      key={file.id}
                      file={file}
                      onRemove={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Process Button */}
            <Button
              variant="image"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '250ms' }}
              onClick={handleProcess}
              disabled={width < 1 || width > 10000 || height < 1 || height > 10000}
            >
              Resize {files.length > 1 ? `${files.length} Images` : 'Image'}
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message={`Resizing ${files.length} image${files.length > 1 ? 's' : ''}...`}
            category="image"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFiles.length > 0 && (
          <>
            {/* Success Header */}
            <SuccessCard icon={Check}>
              <SuccessMessage
                message={resultLabel}
                subtitle={`${processedFiles.length} image${processedFiles.length > 1 ? 's' : ''} ready`}
              />
            </SuccessCard>

            {/* Results List */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {processedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className="space-y-2 animate-slide-up opacity-0"
                      style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
                    >
                      <FilePreview file={file} isProcessed />
                      <DownloadButton file={file} variant="secondary" category="image" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {processedFiles.length > 1 && (
              <DownloadAllButton files={processedFiles} className="w-full" category="image" />
            )}

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resize More Images
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
