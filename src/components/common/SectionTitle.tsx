import { memo, type ReactNode } from 'react';
import type { CardCategory } from '@/components/ui/card';

interface SectionTitleProps {
  /** Tool category for dot color */
  category: NonNullable<CardCategory>;
  /** Section title text */
  children: ReactNode;
}

const dotStyles: Record<NonNullable<CardCategory>, string> = {
  image: 'bg-tool-image',
  pdf: 'bg-tool-pdf',
  text: 'bg-tool-text',
  media: 'bg-tool-media',
};

export const SectionTitle = memo(function SectionTitle({ category, children }: SectionTitleProps) {
  return (
    <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[category]}`} />
      {children}
    </h3>
  );
});
