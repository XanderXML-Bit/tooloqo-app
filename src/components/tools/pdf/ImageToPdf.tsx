import { useState, useCallback } from 'react';
import { FileImage, Check, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { FilePreview } from '@/components/common/FilePreview';
import { DownloadButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pdfService } from '@/services/pdfService';
import { feedback } from '@/services/feedbackService';
import { generateId } from '@/lib/utils';
import type { TooloqoFile } from '@/types';

export function ImageToPdf() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFile(null);
    setError(null);
  }, []);

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);

    try {
      const blobs = files.map((f) => f.blob);
      const pdfBlob = await pdfService.imagesToPdf(blobs);

      let thumbnail: string | undefined;
      try {
        thumbnail = await pdfService.generateThumbnail(pdfBlob);
      } catch {
        // Thumbnail generation failed
      }

      const baseName = files.length === 1
        ? files[0].originalName.replace(/\.[^.]+$/, '')
        : 'images';

      setProcessedFile({
        id: generateId(),
        originalName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        size: pdfBlob.size,
        blob: pdfBlob,
        thumbnail,
        createdAt: new Date(),
      });
    feedback.success();

    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Failed to create PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedFile(null);
    setError(null);
  };

  return (
    <Layout title="Image to PDF" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="pdf"
          icon={FileImage}
          title="Image to PDF"
          description="Convert images into a PDF document"
        />

        {/* File Selection */}
        {files.length === 0 && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={50}
            category="pdf"
          />
        )}

        {/* Image List with Reordering */}
        {files.length > 0 && !isProcessing && !processedFile && (
          <>
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    <span className="font-mono text-tool-pdf">{files.length}</span> image{files.length > 1 ? 's' : ''} selected
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Clear
                  </Button>
                </div>
                {files.length > 1 && (
                  <p className="text-xs text-text-tertiary mb-3">
                    Reorder images to set page order in PDF.
                  </p>
                )}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 bg-surface-highlight rounded-xl border border-border/30"
                    >
                      {files.length > 1 && (
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => moveFile(index, index - 1)}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === files.length - 1}
                            onClick={() => moveFile(index, index + 1)}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {files.length > 1 && (
                        <span className="text-sm font-bold text-tool-pdf w-6 font-mono">
                          {index + 1}
                        </span>
                      )}
                      <div className="flex-1">
                        <FilePreview
                          file={file}
                          onRemove={() =>
                            setFiles((prev) => prev.filter((f) => f.id !== file.id))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="pdf"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '150ms' }}
              onClick={handleProcess}
            >
              Create PDF
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && <ProcessingIndicator message="Creating PDF..." category="pdf" />}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Result */}
        {processedFile && (
          <>
            {/* Success Header */}
            <SuccessCard icon={Check}>
              <SuccessMessage message="PDF created successfully" />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
                  Your PDF
                </h3>
                <FilePreview file={processedFile} isProcessed />
                <div className="mt-3">
                  <DownloadButton file={processedFile} category="pdf" />
                </div>
              </CardContent>
            </Card>

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
