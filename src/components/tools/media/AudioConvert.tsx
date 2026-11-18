import { useState, useCallback } from 'react';
import { Music, Check, RotateCcw, ArrowRight, Download } from 'lucide-react';
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
import type { TooloqoFile, AudioFormat } from '@/types';

const AUDIO_FORMATS: { id: AudioFormat; label: string; description: string }[] = [
  { id: 'mp3', label: 'MP3', description: 'Most compatible' },
  { id: 'wav', label: 'WAV', description: 'Lossless, large' },
  { id: 'aac', label: 'AAC', description: 'Good quality, smaller' },
  { id: 'flac', label: 'FLAC', description: 'Lossless, compressed' },
  { id: 'ogg', label: 'OGG', description: 'Open format' },
  { id: 'm4a', label: 'M4A', description: 'Apple format' },
];

const BITRATE_OPTIONS = [
  { value: 128, label: '128 kbps', description: 'Smaller file' },
  { value: 192, label: '192 kbps', description: 'Balanced' },
  { value: 256, label: '256 kbps', description: 'High quality' },
  { value: 320, label: '320 kbps', description: 'Best quality' },
];

export function AudioConvert() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>('mp3');
  const [selectedBitrate, setSelectedBitrate] = useState(192);

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
      const result = await mediaService.convertAudio(
        file.blob,
        { format: selectedFormat, bitrate: selectedBitrate },
        (p) => setProgress(p)
      );

      const newName = file.originalName.replace(/\.[^.]+$/, `.${selectedFormat}`);

      setProcessedFile({
        id: generateId(),
        originalName: newName,
        mimeType: result.blob.type,
        size: result.blob.size,
        blob: result.blob,
        createdAt: new Date(),
      });

      showToast('Audio converted successfully', 'success');
    feedback.success();

    } catch (err) {
      feedback.error();
      const message = err instanceof Error ? err.message : 'Conversion failed';
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
    <Layout title="Audio Convert" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="media"
          icon={Music}
          title="Audio Converter"
          description="Convert between audio formats"
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
            acceptedMimeTypes={['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp4']}
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
                      <Music className="w-5 h-5 text-tool-media" />
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

            {/* Output Format */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="media">Output Format</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                  {AUDIO_FORMATS.map((format) => (
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

            {/* Bitrate */}
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

            {/* Convert Button */}
            <Button
              variant="media"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '200ms' }}
              onClick={handleProcess}
            >
              Convert to {selectedFormat.toUpperCase()}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message="Converting audio..."
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
                label="Conversion complete"
                sublabel={savedPercentage > 0
                  ? `${savedPercentage}% smaller`
                  : savedPercentage < 0
                    ? `${Math.abs(savedPercentage)}% larger`
                    : 'Same size'}
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
              Convert Another File
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
