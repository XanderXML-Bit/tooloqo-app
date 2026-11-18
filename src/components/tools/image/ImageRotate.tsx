import { useState, useCallback, useEffect } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
} from 'lucide-react';
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
import type { TooloqoFile, ImageRotateOptions } from '@/types';

type RotationDegrees = 0 | 90 | 180 | 270;

export function ImageRotate() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [rotation, setRotation] = useState<RotationDegrees>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate preview when settings change
  useEffect(() => {
    if (files.length === 0) return;
    if (rotation === 0 && !flipH && !flipV) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const generatePreview = async () => {
      try {
        const options: ImageRotateOptions = {
          degrees: rotation,
          flipHorizontal: flipH,
          flipVertical: flipV,
        };
        const rotatedBlob = await imageService.rotate(files[0].blob, options);
        const url = URL.createObjectURL(rotatedBlob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {
        setPreviewUrl(null);
      }
    };

    generatePreview();
  }, [files, rotation, flipH, flipV]);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFiles([]);
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const rotateLeft = () => {
    setRotation((prev) => ((prev - 90 + 360) % 360) as RotationDegrees);
  };

  const rotateRight = () => {
    setRotation((prev) => ((prev + 90) % 360) as RotationDegrees);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    feedback.tap();
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProcessedFiles([]);

    const options: ImageRotateOptions = {
      degrees: rotation,
      flipHorizontal: flipH,
      flipVertical: flipV,
    };

    const results: TooloqoFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const rotatedBlob = await imageService.rotate(file.blob, options);
        const thumbnail = await imageService.generateThumbnail(rotatedBlob);

        const suffix =
          rotation !== 0 || flipH || flipV
            ? `_${rotation}deg${flipH ? '_flipH' : ''}${flipV ? '_flipV' : ''}`
            : '_transformed';

        results.push({
          id: generateId(),
          originalName: file.originalName.replace(/(\.[^.]+)$/, `${suffix}$1`),
          mimeType: rotatedBlob.type,
          size: rotatedBlob.size,
          blob: rotatedBlob,
          thumbnail,
          createdAt: new Date(),
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      setProcessedFiles(results);
      feedback.success();
    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Rotation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles([]);
    setProcessedFiles([]);
    setError(null);
    setPreviewUrl(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <Layout title="Rotate & Flip" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="image"
          icon={RotateCw}
          title="Rotate & Flip"
          description="Adjust orientation instantly"
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
            {/* Preview */}
            {previewUrl && (
              <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <SectionTitle category="image">Preview</SectionTitle>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                      Change Image
                    </Button>
                  </div>
                  <div className="bg-surface-highlight rounded-xl p-4 flex justify-center border border-border/30">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[200px] max-w-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rotation Controls */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="image">Rotate</SectionTitle>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={rotateLeft}
                    className="flex-col h-auto py-3 px-5"
                  >
                    <RotateCcw className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Left</span>
                  </Button>
                  <div className="flex items-center justify-center min-w-[80px]">
                    <span className="text-2xl font-bold text-tool-image font-mono tabular-nums">{rotation}°</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={rotateRight}
                    className="flex-col h-auto py-3 px-5"
                  >
                    <RotateCw className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Right</span>
                  </Button>
                </div>

                {/* Quick rotation buttons */}
                <div className="flex justify-center gap-2 mt-4">
                  {[0, 90, 180, 270].map((deg) => (
                    <Button
                      key={deg}
                      variant={rotation === deg ? 'image' : 'secondary'}
                      size="sm"
                      onClick={() => setRotation(deg as RotationDegrees)}
                    >
                      {rotation === deg && <Check className="h-3 w-3 mr-1" />}
                      {deg}°
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flip Controls */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="image">Flip</SectionTitle>
                <div className="flex gap-3">
                  <Button
                    variant={flipH ? 'image' : 'secondary'}
                    className="flex-1"
                    onClick={() => setFlipH(!flipH)}
                  >
                    {flipH && <Check className="h-4 w-4 mr-1.5" />}
                    <FlipHorizontal className="h-5 w-5 mr-2" />
                    Horizontal
                  </Button>
                  <Button
                    variant={flipV ? 'image' : 'secondary'}
                    className="flex-1"
                    onClick={() => setFlipV(!flipV)}
                  >
                    {flipV && <Check className="h-4 w-4 mr-1.5" />}
                    <FlipVertical className="h-5 w-5 mr-2" />
                    Vertical
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Files count */}
            {files.length > 1 && (
              <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '250ms' }}>
                <CardContent className="p-4">
                  <p className="text-sm text-text-secondary text-center">
                    Will apply to all <span className="font-mono text-tool-image">{files.length}</span> selected images
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Process Button */}
            <Button
              variant="image"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '300ms' }}
              onClick={handleProcess}
              disabled={rotation === 0 && !flipH && !flipV}
            >
              Apply Changes
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message={`Processing ${files.length} image${files.length > 1 ? 's' : ''}...`}
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
                message="Images transformed"
                subtitle={`${processedFiles.length} image${processedFiles.length > 1 ? 's' : ''} ready`}
              />
            </SuccessCard>

            {/* Results List */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
                  Processed Images
                </h3>
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
              Process More Images
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
