import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { CardCategory } from '@/components/ui/card';

interface ToolHeaderProps {
  /** Tool category for theming */
  category: NonNullable<CardCategory>;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tool title */
  title: string;
  /** Brief description */
  description: string;
}

const categoryStyles: Record<NonNullable<CardCategory>, string> = {
  image: 'bg-tool-image/15 text-tool-image',
  pdf: 'bg-tool-pdf/15 text-tool-pdf',
  text: 'bg-tool-text/15 text-tool-text',
  media: 'bg-tool-media/15 text-tool-media',
};

export const ToolHeader = memo(function ToolHeader({ category, icon: Icon, title, description }: ToolHeaderProps) {
  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${categoryStyles[category]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-text-tertiary">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
});
