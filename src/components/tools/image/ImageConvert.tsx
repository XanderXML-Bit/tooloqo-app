import { useState, useCallback } from 'react';
import { RefreshCw, Check, RotateCcw } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { imageService } from '@/services/imageService';
import { feedback } from '@/services/feedbackService';
import { generateId } from '@/lib/utils';
import { getStaggerDelay } from '@/lib/animations';
import type { TooloqoFile, ImageConvertOptions } from '@/types';

type OutputFormat = 'png' | 'jpg' | 'webp';

const FORMATS: { id: OutputFormat; label: string; description: string }[] = [
  { id: 'jpg', label: 'JPG', description: 'Best for photos, smaller size' },
  { id: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
  { id: 'webp', label: 'WebP', description: 'Modern format, great compression' },
];

export function ImageConvert() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [targetFormat, setTargetFormat] = useState<OutputFormat>('jpg');
  const [quality, setQuality] = useState(90);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFiles([]);
    setError(null);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;

    feedback.tap();
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProcessedFiles([]);

    const options: ImageConvertOptions = {
      format: targetFormat,
      quality: targetFormat !== 'png' ? quality : undefined,
    };

    const results: TooloqoFile[] = [];
    const extensions: Record<OutputFormat, string> = {
      jpg: '.jpg',
      png: '.png',
      webp: '.webp',
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const convertedBlob = await imageService.convert(file.blob, options);
        const thumbnail = await imageService.generateThumbnail(convertedBlob);

        // Replace extension in filename (handle files with no extension)
        const newName = /\.[^.]+$/.test(file.originalName)
          ? file.originalName.replace(/\.[^.]+$/, extensions[targetFormat])
          : file.originalName + extensions[targetFormat];

        results.push({
          id: generateId(),
          originalName: newName,
          mimeType: convertedBlob.type,
          size: convertedBlob.size,
          blob: convertedBlob,
          thumbnail,
          createdAt: new Date(),
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      setProcessedFiles(results);
      feedback.success();
    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedFiles([]);
    setError(null);
  };

  return (
    <Layout title="Format Convert" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="image"
          icon={RefreshCw}
          title="Convert Format"
          description="Change image format instantly"
        />

        {/* File Selection */}
        {files.length === 0 && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp', 'image/heic']}
            maxFiles={20}
            category="image"
          />
        )}

        {/* Options */}
        {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
          <>
            {/* Format Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="image">Convert to</SectionTitle>
                <div className="space-y-2">
                  {FORMATS.map((format) => (
                    <Button
                      key={format.id}
                      variant={targetFormat === format.id ? 'image' : 'secondary'}
                      className="w-full justify-between"
                      onClick={() => setTargetFormat(format.id)}
                    >
                      <span className="flex items-center gap-2">
                        {targetFormat === format.id && <Check className="h-3.5 w-3.5" />}
                        <span className="font-semibold">{format.label}</span>
                      </span>
                      <span className="text-xs opacity-70">{format.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Slider (for JPG and WebP) */}
            {targetFormat !== 'png' && (
              <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tool-image" />
                      Quality
                    </h3>
                    <span className="text-sm font-bold text-tool-image font-mono tabular-nums">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    aria-label="Conversion quality level"
                    className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-tool-image"
                  />
                </CardContent>
              </Card>
            )}

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
                      onRemove={() =>
                        setFiles((prev) => prev.filter((f) => f.id !== file.id))
                      }
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
            >
              Convert to {targetFormat.toUpperCase()}
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message={`Converting to ${targetFormat.toUpperCase()}...`}
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
                message={`Converted to ${targetFormat.toUpperCase()}`}
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
              Convert More Images
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
