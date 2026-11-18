import { useState, useCallback, useEffect, useRef } from 'react';
import { Music, Video, Check, RotateCcw, ArrowRight, Download } from 'lucide-react';
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
import type { TooloqoFile, ExtractAudioOptions } from '@/types';

const FORMAT_OPTIONS: { id: ExtractAudioOptions['format']; label: string; description: string }[] = [
  { id: 'mp3', label: 'MP3', description: 'Most compatible' },
  { id: 'wav', label: 'WAV', description: 'Lossless' },
  { id: 'aac', label: 'AAC', description: 'Good quality' },
];

const BITRATE_OPTIONS = [
  { value: 128, label: '128 kbps', description: 'Smaller file' },
  { value: 192, label: '192 kbps', description: 'Balanced' },
  { value: 256, label: '256 kbps', description: 'High quality' },
  { value: 320, label: '320 kbps', description: 'Best quality' },
];

export function ExtractAudio() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<ExtractAudioOptions['format']>('mp3');
  const [selectedBitrate, setSelectedBitrate] = useState(192);
  const [videoDuration, setVideoDuration] = useState(0);

  const videoUrl = useRef<string | null>(null);
  const audioPreviewUrl = useRef<string | null>(null);

  const { isLoadingFFmpeg, engineError, retryEngine } = useMediaEngine(file);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl.current) {
        URL.revokeObjectURL(videoUrl.current);
      }
      if (audioPreviewUrl.current) {
        URL.revokeObjectURL(audioPreviewUrl.current);
      }
    };
  }, []);

  const handleFilesSelected = useCallback(async (selectedFiles: TooloqoFile[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setProcessedFile(null);
      setError(null);

      // Clean up previous video URL
      if (videoUrl.current) {
        URL.revokeObjectURL(videoUrl.current);
      }

      videoUrl.current = URL.createObjectURL(selectedFile.blob);

      try {
        const duration = await mediaService.getVideoDuration(selectedFile.blob);
        setVideoDuration(duration);
      } catch {
        // Duration is optional, continue anyway
        setVideoDuration(0);
      }
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await mediaService.extractAudio(
        file.blob,
        { format: selectedFormat, bitrate: selectedBitrate },
        (p) => setProgress(p)
      );

      const newName = file.originalName.replace(/\.[^.]+$/, `.${selectedFormat}`);

      // Clean up previous audio preview URL
      if (audioPreviewUrl.current) {
        URL.revokeObjectURL(audioPreviewUrl.current);
      }
      audioPreviewUrl.current = URL.createObjectURL(result.blob);

      setProcessedFile({
        id: generateId(),
        originalName: newName,
        mimeType: result.blob.type,
        size: result.blob.size,
        blob: result.blob,
        createdAt: new Date(),
      });

      showToast('Audio extracted successfully', 'success');
    feedback.success();

    } catch (err) {
      feedback.error();
      const message = err instanceof Error ? err.message : 'Extraction failed';
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
    if (videoUrl.current) {
      URL.revokeObjectURL(videoUrl.current);
      videoUrl.current = null;
    }
    setFile(null);
    setProcessedFile(null);
    setError(null);
    setProgress(0);
    setVideoDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout title="Extract Audio" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="media"
          icon={Music}
          title="Extract Audio"
          description="Extract audio track from video files"
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
                      <p className="text-sm font-medium text-text-primary truncate max-w-40">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-text-tertiary font-mono">
                        {formatFileSize(file.size)}
                        {videoDuration > 0 && ` • ${formatDuration(videoDuration)}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Format */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="media">Audio Format</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_OPTIONS.map((format) => (
                    <Button
                      key={format.id}
                      variant={selectedFormat === format.id ? 'media' : 'secondary'}
                      size="sm"
                      className="flex-col h-auto py-2.5"
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <span className="flex items-center gap-1">
                        {selectedFormat === format.id && <Check className="h-3 w-3" />}
                        {format.label}
                      </span>
                      <span className="text-[10px] opacity-70 font-normal">
                        {format.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bitrate - Only show for lossy formats */}
            {selectedFormat !== 'wav' && (
              <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-4">
                  <SectionTitle category="media">Quality (Bitrate)</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    {BITRATE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedBitrate === option.value ? 'media' : 'secondary'}
                        size="sm"
                        className="justify-between"
                        onClick={() => setSelectedBitrate(option.value)}
                      >
                        <span className="flex items-center gap-1">
                          {selectedBitrate === option.value && <Check className="h-3 w-3" />}
                          {option.label}
                        </span>
                        <span className="text-xs opacity-70">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Extract Button */}
            <Button
              variant="media"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '200ms' }}
              onClick={handleProcess}
            >
              Extract Audio
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message="Extracting audio..."
            category="media"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFile && (
          <>
            <SuccessCard icon={Music}>
              <SuccessMetric
                value={selectedFormat.toUpperCase()}
                label="Audio extracted"
                sublabel={formatFileSize(processedFile.size)}
              />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tool-media/10 flex items-center justify-center">
                      <Music className="w-5 h-5 text-tool-media" />
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

                {/* Audio Preview */}
                <div className="mb-4">
                  <audio
                    src={audioPreviewUrl.current ?? ''}
                    controls
                    className="w-full h-10"
                  />
                </div>

                <Button
                  variant="media"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {selectedFormat.toUpperCase()}
                </Button>
              </CardContent>
            </Card>

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Extract From Another Video
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
