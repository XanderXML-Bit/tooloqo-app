import { useState, useCallback } from 'react';
import { Minimize2, Check, RotateCcw, TrendingDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { FilePreview } from '@/components/common/FilePreview';
import { DownloadButton, DownloadAllButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMetric } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { imageService } from '@/services/imageService';
import { feedback } from '@/services/feedbackService';
import { formatFileSize } from '@/lib/utils';
import { getStaggerDelay } from '@/lib/animations';
import type { TooloqoFile } from '@/types';

const QUALITY_PRESETS = [
  { id: 'high', label: 'High Quality', quality: 85, description: 'Best quality, larger file' },
  { id: 'balanced', label: 'Balanced', quality: 70, description: 'Good balance' },
  { id: 'small', label: 'Small Size', quality: 50, description: 'Smaller file, lower quality' },
];

export function ImageCompress() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const [quality, setQuality] = useState(70);
  const [originalSizes, setOriginalSizes] = useState<Map<string, number>>(new Map());

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFiles([]);
    setError(null);
    // Store original sizes
    const sizes = new Map<string, number>();
    selectedFiles.forEach((f) => sizes.set(f.id, f.size));
    setOriginalSizes(sizes);
  }, []);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = QUALITY_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setQuality(preset.quality);
    }
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    setSelectedPreset('custom');
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    feedback.tap();
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProcessedFiles([]);

    const results: TooloqoFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBlob = await imageService.compress(file.blob, { quality });
        const thumbnail = await imageService.generateThumbnail(compressedBlob);

        results.push({
          id: file.id, // Keep same ID to match with original
          originalName: file.originalName.replace(/(\.[^.]+)$/, '_compressed$1'),
          mimeType: compressedBlob.type,
          size: compressedBlob.size,
          blob: compressedBlob,
          thumbnail,
          createdAt: new Date(),
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      setProcessedFiles(results);
      feedback.success();
    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Compression failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedFiles([]);
    setError(null);
    setOriginalSizes(new Map());
  };

  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalCompressedSize = processedFiles.reduce((sum, f) => sum + f.size, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const savedPercentage =
    totalOriginalSize > 0 ? Math.max(0, Math.round((totalSaved / totalOriginalSize) * 100)) : 0;
  const sizeIncreased = totalCompressedSize > totalOriginalSize;

  return (
    <Layout title="Image Compress" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="image"
          icon={Minimize2}
          title="Compress Image"
          description="Reduce file size while keeping quality"
        />

        {/* File Selection */}
        {files.length === 0 && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={20}
            category="image"
          />
        )}

        {/* Options */}
        {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
          <>
            {/* Quality Presets */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="image">Quality Preset</SectionTitle>
                <div className="space-y-2">
                  {QUALITY_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset === preset.id ? 'image' : 'secondary'}
                      className="w-full justify-between"
                      onClick={() => handlePresetChange(preset.id)}
                    >
                      <span className="flex items-center gap-2">
                        {selectedPreset === preset.id && <Check className="h-3.5 w-3.5" />}
                        {preset.label}
                      </span>
                      <span className="text-xs opacity-70">{preset.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Slider */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tool-image" />
                    Quality Level
                  </h3>
                  <span className="text-sm font-bold text-tool-image font-mono tabular-nums">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  aria-label="Compression quality level"
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-tool-image"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-2 font-medium">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Files */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    <span className="font-mono text-tool-image">{files.length}</span> file{files.length > 1 ? 's' : ''} •{' '}
                    <span className="font-mono tabular-nums">{formatFileSize(totalOriginalSize)}</span>
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
              Compress {files.length > 1 ? `${files.length} Images` : 'Image'}
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message={`Compressing ${files.length} image${files.length > 1 ? 's' : ''}...`}
            category="image"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFiles.length > 0 && (
          <>
            {/* Success Header */}
            <SuccessCard icon={TrendingDown}>
              <SuccessMetric
                value={sizeIncreased ? 'N/A' : `${savedPercentage}%`}
                label={sizeIncreased ? 'Already optimized' : `Saved ${formatFileSize(totalSaved)}`}
                sublabel={`${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)}`}
              />
            </SuccessCard>

            {/* Results List */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
                  Compressed Images
                </h3>
                <div className="space-y-3">
                  {processedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className="space-y-2 animate-slide-up opacity-0"
                      style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
                    >
                      <FilePreview
                        file={file}
                        isProcessed
                        originalSize={originalSizes.get(file.id)}
                      />
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
              Compress More Images
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
