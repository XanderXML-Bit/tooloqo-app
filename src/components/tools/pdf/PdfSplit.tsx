import { useState, useCallback, useEffect } from 'react';
import { Scissors, Check, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { DownloadButton, DownloadAllButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pdfService } from '@/services/pdfService';
import { feedback } from '@/services/feedbackService';
import { generateId } from '@/lib/utils';
import { getStaggerDelay } from '@/lib/animations';
import type { TooloqoFile } from '@/types';

type SplitMode = 'select' | 'all';

export function PdfSplit() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [splitMode, setSplitMode] = useState<SplitMode>('select');

  // Get page count when file is selected
  useEffect(() => {
    if (file) {
      pdfService.getPageCount(file.blob).then(setPageCount);
    }
  }, [file]);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setProcessedFiles([]);
      setError(null);
      setSelectedPages(new Set());
      setPageCount(0);
    }
  }, []);

  const togglePage = (pageNum: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
  };

  const selectAll = () => {
    const all = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    setSelectedPages(all);
  };

  const selectNone = () => {
    setSelectedPages(new Set());
  };

  const handleProcess = async () => {
    if (!file) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);

    try {
      let resultBlobs: Blob[];
      let fileNames: string[];

      if (splitMode === 'all') {
        resultBlobs = await pdfService.splitAll(file.blob);
        fileNames = resultBlobs.map((_, i) => `page_${i + 1}.pdf`);
      } else {
        const pages = Array.from(selectedPages).sort((a, b) => a - b);
        if (pages.length === 0) {
          throw new Error('No pages selected');
        }
        const singleBlob = await pdfService.split(file.blob, pages);
        resultBlobs = [singleBlob];
        fileNames = [`extracted_pages.pdf`];
      }

      const results: TooloqoFile[] = await Promise.all(
        resultBlobs.map(async (blob, i) => {
          let thumbnail: string | undefined;
          try {
            thumbnail = await pdfService.generateThumbnail(blob);
          } catch {
            // Thumbnail generation failed
          }

          return {
            id: generateId(),
            originalName: fileNames[i],
            mimeType: 'application/pdf',
            size: blob.size,
            blob,
            thumbnail,
            createdAt: new Date(),
          };
        })
      );

      setProcessedFiles(results);
    feedback.success();

    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProcessedFiles([]);
    setError(null);
    setSelectedPages(new Set());
    setPageCount(0);
  };

  return (
    <Layout title="PDF Split" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="pdf"
          icon={Scissors}
          title="Split PDF"
          description="Extract pages or split into individual files"
        />

        {/* File Selection */}
        {!file && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['application/pdf']}
            maxFiles={1}
            category="pdf"
          />
        )}

        {/* Options */}
        {file && !isProcessing && processedFiles.length === 0 && (
          <>
            {/* File Info */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-text-tertiary font-mono tabular-nums">
                      {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Split Mode */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="pdf">Split Mode</SectionTitle>
                <div className="space-y-2">
                  <Button
                    variant={splitMode === 'select' ? 'pdf' : 'secondary'}
                    className="w-full justify-start"
                    onClick={() => setSplitMode('select')}
                  >
                    {splitMode === 'select' && <Check className="h-3.5 w-3.5 mr-2" />}
                    Extract Selected Pages
                  </Button>
                  <Button
                    variant={splitMode === 'all' ? 'pdf' : 'secondary'}
                    className="w-full justify-start"
                    onClick={() => setSplitMode('all')}
                  >
                    {splitMode === 'all' && <Check className="h-3.5 w-3.5 mr-2" />}
                    Split Into Individual Pages
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Page Selection */}
            {splitMode === 'select' && pageCount > 0 && (
              <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                      Select Pages (<span className="font-mono text-tool-pdf">{selectedPages.size}</span> selected)
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={selectAll} className="text-text-tertiary">
                        All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={selectNone} className="text-text-tertiary">
                        None
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Button
                          key={pageNum}
                          variant={selectedPages.has(pageNum) ? 'pdf' : 'secondary'}
                          size="sm"
                          onClick={() => togglePage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process Button */}
            <Button
              variant="pdf"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '250ms' }}
              onClick={handleProcess}
              disabled={splitMode === 'select' && selectedPages.size === 0}
            >
              {splitMode === 'all'
                ? `Split into ${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'}`
                : `Extract ${selectedPages.size} ${selectedPages.size === 1 ? 'Page' : 'Pages'}`}
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && <ProcessingIndicator message="Splitting PDF..." category="pdf" />}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFiles.length > 0 && (
          <>
            {/* Success Header */}
            <SuccessCard icon={Check}>
              <SuccessMessage
                message="PDF split successfully"
                subtitle={`${processedFiles.length} file${processedFiles.length > 1 ? 's' : ''} created`}
              />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {processedFiles.map((f, index) => (
                    <div
                      key={f.id}
                      className="space-y-2 animate-slide-up opacity-0"
                      style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
                    >
                      <div className="flex items-center justify-between p-2 bg-surface-highlight rounded-lg border border-border/30">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {f.originalName}
                        </span>
                      </div>
                      <DownloadButton file={f} variant="secondary" category="pdf" />
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
              Split Another PDF
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
