import { useState, useMemo } from 'react';
import { GitCompare, ArrowUpDown, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { textService } from '@/services/textService';
import { cn } from '@/lib/utils';

export function TextCompare() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const diff = useMemo(() => {
    if (!text1 && !text2) return [];
    return textService.compareTexts(text1, text2);
  }, [text1, text2]);

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === 'add').length;
    const removed = diff.filter((d) => d.type === 'remove').length;
    const equal = diff.filter((d) => d.type === 'equal').length;
    return { added, removed, equal };
  }, [diff]);

  const handleCompare = () => {
    setShowDiff(true);
  };

  const handleReset = () => {
    setShowDiff(false);
  };

  const handleSwap = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
    if (showDiff) setShowDiff(false);
  };

  return (
    <Layout title="Text Compare" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="text"
          icon={GitCompare}
          title="Text Compare"
          description="Find differences between texts"
        />

        {!showDiff ? (
          <>
            {/* Text 1 */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="text">Original Text</SectionTitle>
                <textarea
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Enter original text..."
                  aria-label="Original text for comparison"
                  className="w-full h-32 bg-surface-highlight border border-border/50 rounded-xl p-3 outline-none focus:border-tool-text/50 focus:ring-1 focus:ring-tool-text/20 text-text-primary placeholder:text-text-tertiary resize-none transition-colors"
                />
              </CardContent>
            </Card>

            {/* Swap Button */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '150ms' }}>
              <Button variant="ghost" size="sm" onClick={handleSwap} className="text-text-tertiary">
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                Swap
              </Button>
            </div>

            {/* Text 2 */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="text">Modified Text</SectionTitle>
                <textarea
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  placeholder="Enter modified text..."
                  aria-label="Modified text for comparison"
                  className="w-full h-32 bg-surface-highlight border border-border/50 rounded-xl p-3 outline-none focus:border-tool-text/50 focus:ring-1 focus:ring-tool-text/20 text-text-primary placeholder:text-text-tertiary resize-none transition-colors"
                />
              </CardContent>
            </Card>

            {/* Compare Button */}
            <Button
              variant="text"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '250ms' }}
              onClick={handleCompare}
              disabled={!text1 && !text2}
            >
              Compare Texts
            </Button>
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-success/30 animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-success font-mono tabular-nums">+{stats.added}</p>
                  <p className="text-xs text-text-tertiary">Added</p>
                </CardContent>
              </Card>
              <Card className="border-error/30 animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-error font-mono tabular-nums">-{stats.removed}</p>
                  <p className="text-xs text-text-tertiary">Removed</p>
                </CardContent>
              </Card>
              <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-text-primary font-mono tabular-nums">{stats.equal}</p>
                  <p className="text-xs text-text-tertiary">Unchanged</p>
                </CardContent>
              </Card>
            </div>

            {/* Diff View */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '250ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="text">Differences</SectionTitle>
                <div className="bg-surface-highlight rounded-xl p-3 max-h-96 overflow-y-auto font-mono text-sm border border-border/30">
                  {diff.length === 0 ? (
                    <p className="text-text-tertiary italic">No differences found</p>
                  ) : (
                    diff.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          'px-2 py-1 rounded',
                          item.type === 'add' && 'bg-success/20 text-success',
                          item.type === 'remove' && 'bg-error/20 text-error line-through',
                          item.type === 'equal' && 'text-text-tertiary'
                        )}
                      >
                        <span className="mr-2 opacity-70">
                          {item.type === 'add' && '+'}
                          {item.type === 'remove' && '-'}
                          {item.type === 'equal' && ' '}
                        </span>
                        {item.value || <span className="italic opacity-50">(empty line)</span>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Compare Again
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
