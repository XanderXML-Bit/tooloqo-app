import { useState, useCallback } from 'react';
import { Minimize2, Check, RotateCcw, TrendingDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { FilePreview } from '@/components/common/FilePreview';
import { DownloadButton, DownloadAllButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMetric, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pdfService } from '@/services/pdfService';
import { feedback } from '@/services/feedbackService';
import { formatFileSize } from '@/lib/utils';
import { getStaggerDelay } from '@/lib/animations';
import type { TooloqoFile } from '@/types';

export function PdfCompress() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [originalSizes, setOriginalSizes] = useState<Map<string, number>>(new Map());

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFiles([]);
    setError(null);
    const sizes = new Map<string, number>();
    selectedFiles.forEach((f) => sizes.set(f.id, f.size));
    setOriginalSizes(sizes);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const results: TooloqoFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBlob = await pdfService.compress(file.blob);

        let thumbnail: string | undefined;
        try {
          thumbnail = await pdfService.generateThumbnail(compressedBlob);
        } catch {
          // Thumbnail generation failed
        }

        results.push({
          id: file.id,
          originalName: file.originalName.replace('.pdf', '_compressed.pdf'),
          mimeType: 'application/pdf',
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
    totalOriginalSize > 0 ? Math.round((totalSaved / totalOriginalSize) * 100) : 0;

  return (
    <Layout title="PDF Compress" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="pdf"
          icon={Minimize2}
          title="Compress PDF"
          description="Reduce file size by optimizing"
        />

        {/* File Selection */}
        {files.length === 0 && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['application/pdf']}
            maxFiles={10}
            category="pdf"
          />
        )}

        {/* Selected Files */}
        {files.length > 0 && !isProcessing && processedFiles.length === 0 && (
          <>
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    <span className="font-mono text-tool-pdf">{files.length}</span> PDF{files.length > 1 ? 's' : ''} •{' '}
                    <span className="font-mono tabular-nums">{formatFileSize(totalOriginalSize)}</span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Clear
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
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

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <p className="text-sm text-text-tertiary">
                  PDF compression removes metadata and optimizes the file structure.
                  Results may vary based on the PDF content.
                </p>
              </CardContent>
            </Card>

            <Button
              variant="pdf"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '200ms' }}
              onClick={handleProcess}
            >
              Compress {files.length > 1 ? `${files.length} PDFs` : 'PDF'}
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message={`Compressing ${files.length} PDF${files.length > 1 ? 's' : ''}...`}
            category="pdf"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFiles.length > 0 && (
          <>
            {/* Success Header */}
            {savedPercentage > 0 ? (
              <SuccessCard icon={TrendingDown}>
                <SuccessMetric
                  value={`${savedPercentage}%`}
                  label={`Saved ${formatFileSize(totalSaved)}`}
                  sublabel={`${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)}`}
                />
              </SuccessCard>
            ) : (
              <SuccessCard icon={Check}>
                <SuccessMessage
                  message="PDF is already optimized"
                  subtitle="No further compression possible"
                />
              </SuccessCard>
            )}

            {/* Results List */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
                  Compressed PDFs
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
                      <DownloadButton file={file} variant="secondary" category="pdf" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {processedFiles.length > 1 && (
              <DownloadAllButton files={processedFiles} className="w-full" category="pdf" />
            )}

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Compress More PDFs
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
