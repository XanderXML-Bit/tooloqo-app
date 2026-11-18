import { useState, useCallback } from 'react';
import { Video, Check, RotateCcw, ArrowRight, Download } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMetric } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mediaService } from '@/services/mediaService';
import { useMediaEngine } from '@/hooks/useMediaEngine';
import { feedback } from '@/services/feedbackService';
import { formatFileSize, generateId } from '@/lib/utils';
import { showToast } from '@/components/common/Toast';
import type { TooloqoFile, VideoCompressPreset } from '@/types';

const PRESET_OPTIONS: { id: VideoCompressPreset; label: string; description: string }[] = [
  { id: 'web', label: 'Web', description: 'Good for streaming' },
  { id: 'mobile', label: 'Mobile', description: 'Smaller, 720p max' },
  { id: 'archive', label: 'Archive', description: 'Best quality' },
];

export function VideoCompress() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<VideoCompressPreset>('web');

  const { isLoadingFFmpeg, engineError, retryEngine } = useMediaEngine(file);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setProcessedFile(null);
      setError(null);
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await mediaService.compressVideo(
        file.blob,
        { preset: selectedPreset },
        (p) => setProgress(p)
      );

      const newName = file.originalName.replace(/\.[^.]+$/, '_compressed.mp4');

      setProcessedFile({
        id: generateId(),
        originalName: newName,
        mimeType: result.blob.type,
        size: result.blob.size,
        blob: result.blob,
        createdAt: new Date(),
      });

      showToast('Video compressed successfully', 'success');
    feedback.success();

    } catch (err) {
      feedback.error();
      const message = err instanceof Error ? err.message : 'Compression failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;

    const url = URL.createObjectURL(processedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = processedFile.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setProcessedFile(null);
    setError(null);
    setProgress(0);
  };

  const savedBytes = file && processedFile ? file.size - processedFile.size : 0;
  const savedPercentage = file && processedFile && file.size > 0
    ? Math.round((savedBytes / file.size) * 100)
    : 0;

  return (
    <Layout title="Video Compress" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="media"
          icon={Video}
          title="Video Compressor"
          description="Reduce video file sizes on-device"
        />

        {isLoadingFFmpeg && (
          <Card className="border-tool-media/30">
            <CardContent className="p-4" role="status">
              <p className="text-sm text-text-secondary">Loading media engine...</p>
              <p className="text-xs text-text-tertiary mt-2">
                First use downloads about 32 MB. Your file stays on your device.
              </p>
            </CardContent>
          </Card>
        )}
        {engineError && <ErrorCard error={engineError} onRetry={retryEngine} retryText="Try again" />}

        {/* File Selection */}
        {!file && !isLoadingFFmpeg && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']}
            maxFiles={1}
            category="media"
          />
        )}

        {/* Options */}
        {file && !isProcessing && !processedFile && !isLoadingFFmpeg && !engineError && (
          <>
            {/* Selected File */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '50ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tool-media/10 flex items-center justify-center">
                      <Video className="w-5 h-5 text-tool-media" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate max-w-48">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-text-tertiary font-mono">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compression Preset */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="media">Compression Preset</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_OPTIONS.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset === preset.id ? 'media' : 'secondary'}
                      size="sm"
                      className="flex-col h-auto py-2.5"
                      onClick={() => setSelectedPreset(preset.id)}
                    >
                      <span className="flex items-center gap-1">
                        {selectedPreset === preset.id && <Check className="h-3 w-3" />}
                        {preset.label}
                      </span>
                      <span className="text-[10px] opacity-70 font-normal">
                        {preset.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compress Button */}
            <Button
              variant="media"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '150ms' }}
              onClick={handleProcess}
            >
              Compress Video
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message="Compressing video..."
            category="media"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFile && (
          <>
            <SuccessCard icon={Video}>
              <SuccessMetric
                value={savedPercentage > 0 ? `${savedPercentage}%` : '0%'}
                label="Size reduced"
                sublabel={`${formatFileSize(file!.size)} → ${formatFileSize(processedFile.size)}`}
              />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tool-media/10 flex items-center justify-center">
                      <Video className="w-5 h-5 text-tool-media" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate max-w-40">
                        {processedFile.originalName}
                      </p>
                      <p className="text-xs text-text-tertiary font-mono">
                        {formatFileSize(processedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="media"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Compressed Video
                </Button>
              </CardContent>
            </Card>

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Compress Another Video
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
