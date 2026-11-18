import { useState } from 'react';
import { Type, Copy, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { textService, type CaseType } from '@/services/textService';
import { useScrollIntoView } from '@/hooks/useScrollIntoView';

const CASE_OPTIONS: { id: CaseType; label: string; example: string }[] = [
  { id: 'upper', label: 'UPPERCASE', example: 'HELLO WORLD' },
  { id: 'lower', label: 'lowercase', example: 'hello world' },
  { id: 'title', label: 'Title Case', example: 'Hello World' },
  { id: 'sentence', label: 'Sentence case', example: 'Hello world. This is a test.' },
  { id: 'toggle', label: 'tOGGLE cASE', example: 'hELLO wORLD' },
];

export function CaseConvert() {
  const [inputText, setInputText] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseType>('upper');
  const [copied, setCopied] = useState(false);
  // Counts case picks. Each pick scrolls the result into view; typing does not.
  const [casePicks, setCasePicks] = useState(0);
  const outputRef = useScrollIntoView<HTMLDivElement>(casePicks);

  const outputText = inputText ? textService.convertCase(inputText, selectedCase) : '';

  const handleCopy = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout title="Case Converter" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="text"
          icon={Type}
          title="Case Converter"
          description="Transform text case instantly"
        />

        {/* Input */}
        <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <SectionTitle category="text">Input Text</SectionTitle>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your text here..."
              aria-label="Input text for case conversion"
              className="w-full h-32 bg-surface-highlight border border-border/50 rounded-xl p-3 outline-none focus:border-tool-text/50 focus:ring-1 focus:ring-tool-text/20 text-text-primary placeholder:text-text-tertiary resize-none transition-colors"
            />
          </CardContent>
        </Card>

        {/* Case Options */}
        <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4">
            <SectionTitle category="text">Convert to</SectionTitle>
            <div className="space-y-2">
              {CASE_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedCase === option.id ? 'text' : 'secondary'}
                  className="w-full justify-between"
                  onClick={() => {
                    setSelectedCase(option.id);
                    setCasePicks((n) => n + 1);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {selectedCase === option.id && <Check className="h-3.5 w-3.5" />}
                    {option.label}
                  </span>
                  <span className="text-xs opacity-70 font-mono">{option.example}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        {outputText && (
          <Card ref={outputRef} className="border-success/50 bg-success/5 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Result
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-text-tertiary">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-surface-highlight rounded-xl p-3 min-h-[80px] border border-border/30">
                <p className="text-text-primary whitespace-pre-wrap break-words">
                  {outputText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
