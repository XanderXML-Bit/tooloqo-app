import { useState, useEffect } from 'react';
import { Hash, Clock, FileText, Type, AlignLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { textService, type WordCountResult } from '@/services/textService';
import { getStaggerDelay } from '@/lib/animations';

export function WordCount() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<WordCountResult>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
    speakingTimeMinutes: 0,
  });

  useEffect(() => {
    setResult(textService.wordCount(text));
  }, [text]);

  const stats = [
    { label: 'Characters', value: result.characters, icon: Hash },
    { label: 'No spaces', value: result.charactersNoSpaces, icon: Hash },
    { label: 'Words', value: result.words, icon: Type },
    { label: 'Sentences', value: result.sentences, icon: FileText },
    { label: 'Paragraphs', value: result.paragraphs, icon: AlignLeft },
    {
      label: 'Reading',
      value:
        result.readingTimeMinutes > 0
          ? `${result.readingTimeMinutes} min`
          : '< 1 min',
      icon: Clock,
    },
    {
      label: 'Speaking',
      value:
        result.speakingTimeMinutes > 0
          ? `${result.speakingTimeMinutes} min`
          : '< 1 min',
      icon: Clock,
    },
  ];

  return (
    <Layout title="Word Counter" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="text"
          icon={Hash}
          title="Word Counter"
          description="Count words, characters & reading time"
        />

        {/* Text Input */}
        <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <SectionTitle category="text">Your Text</SectionTitle>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              aria-label="Text for word counting"
              className="min-h-[200px] resize-y"
            />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4">
            <SectionTitle category="text">Statistics</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ label, value, icon: Icon }, index) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 bg-surface-highlight rounded-xl border border-border/30 animate-slide-up opacity-0"
                  style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
                >
                  <div className="p-2 rounded-lg bg-tool-text/10">
                    <Icon className="h-4 w-4 text-tool-text" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-primary font-mono tabular-nums">
                      {value}
                    </p>
                    <p className="text-xs text-text-tertiary">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
