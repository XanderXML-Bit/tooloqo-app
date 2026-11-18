import { Link } from 'react-router-dom';
import {
  Image,
  FileText,
  Film,
  Type,
  Zap,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AdBanner } from '@/components/common/AdBanner';
import { TooloqoMark } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import type { CardCategory } from '@/components/ui/card';

/**
 * Tool categories with Precision Tools styling
 */
const categories: {
  id: string;
  name: string;
  description: string;
  toolCount: number;
  icon: typeof Image;
  category: CardCategory;
  gradient: string;
  to: string;
}[] = [
  {
    id: 'image',
    name: 'Image',
    description: 'Resize, compress, crop & convert',
    toolCount: 5,
    icon: Image,
    category: 'image',
    gradient: 'from-blue-500/20 to-blue-600/5',
    to: '/image',
  },
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Merge, split, compress & convert',
    toolCount: 5,
    icon: FileText,
    category: 'pdf',
    gradient: 'from-red-500/20 to-red-600/5',
    to: '/pdf',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Word count, case & compare',
    toolCount: 3,
    icon: Type,
    category: 'text',
    gradient: 'from-green-500/20 to-green-600/5',
    to: '/text',
  },
  {
    id: 'media',
    name: 'Media',
    description: 'Compress, GIF, extract & convert',
    toolCount: 4,
    icon: Film,
    category: 'media',
    gradient: 'from-purple-500/20 to-purple-600/5',
    to: '/media',
  },
];

const categoryColors: Record<NonNullable<CardCategory>, string> = {
  image: 'bg-tool-image/10 text-tool-image',
  pdf: 'bg-tool-pdf/10 text-tool-pdf',
  text: 'bg-tool-text/10 text-tool-text',
  media: 'bg-tool-media/10 text-tool-media',
};

/**
 * Home page with Precision Tools styling
 * Features: brand hero, animated tool cards, staggered reveals
 */
export function Home() {
  return (
    <Layout title="Tooloqo">
      <div className="p-4 space-y-8">
        {/* Hero Section */}
        <section className="text-center pt-4 pb-2">
          {/* Animated brand mark */}
          <div className="flex justify-center mb-4">
            <div className="animate-hero-reveal">
              <TooloqoMark className="h-14 w-14" />
            </div>
          </div>

          {/* Brand name */}
          <h1
            className="text-3xl font-bold tracking-tight text-gradient-primary"
          >
            Tooloqo
          </h1>

          {/* Tagline */}
          <p
            className="text-sm text-text-secondary mt-2 flex items-center justify-center gap-1.5 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <Zap className="h-3.5 w-3.5 text-accent-500" />
            <span>Your precision file toolkit</span>
          </p>
        </section>

        {/* Tool Categories Grid */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.id} to={cat.to}>
                  <Card
                    variant="interactive"
                    category={cat.category}
                    className={cn(
                      'h-full animate-card-reveal overflow-hidden group',
                      'opacity-0'
                    )}
                    style={{ animationDelay: `${300 + index * 75}ms` }}
                  >
                    {/* Gradient background */}
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-0',
                        'group-hover:opacity-100 transition-opacity duration-300',
                        cat.gradient
                      )}
                    />

                    <CardContent className="p-4 flex flex-col items-center text-center relative">
                      {/* Icon with category color */}
                      <div
                        className={cn(
                          'p-3.5 rounded-2xl mb-3',
                          'transition-all duration-300',
                          'group-hover:scale-110',
                          categoryColors[cat.category!]
                        )}
                      >
                        <Icon className="h-7 w-7" strokeWidth={1.75} />
                      </div>

                      {/* Title */}
                      <h2 className="font-semibold text-text-primary text-base mb-0.5 tracking-tight">
                        {cat.name}
                      </h2>

                      {/* Description */}
                      <p className="text-xs text-text-tertiary leading-relaxed">
                        {cat.description}
                      </p>

                      {/* Tool count badge */}
                      <span className="mt-2.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-highlight text-text-secondary">
                        {cat.toolCount} tools
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Ad Banner */}
        <section
          className="animate-fade-in opacity-0"
          style={{ animationDelay: '600ms' }}
        >
          <AdBanner slot="home" />
        </section>

        {/* Bottom padding for safe area */}
        <div className="h-4" />
      </div>
    </Layout>
  );
}
