import { Link } from 'react-router-dom';
import {
  Image,
  Maximize2,
  Minimize2,
  Crop,
  RefreshCw,
  RotateCw,
  ChevronRight,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AdBanner } from '@/components/common/AdBanner';
import { cn } from '@/lib/utils';

const tools = [
  {
    id: 'resize',
    name: 'Resize',
    description: 'Change dimensions for social media',
    icon: Maximize2,
  },
  {
    id: 'compress',
    name: 'Compress',
    description: 'Reduce file size intelligently',
    icon: Minimize2,
  },
  {
    id: 'crop',
    name: 'Crop',
    description: 'Crop to any aspect ratio',
    icon: Crop,
  },
  {
    id: 'convert',
    name: 'Convert',
    description: 'PNG, JPG, WebP formats',
    icon: RefreshCw,
  },
  {
    id: 'rotate',
    name: 'Rotate & Flip',
    description: 'Rotate or mirror images',
    icon: RotateCw,
  },
];

/**
 * Image Tools page with Precision Tools styling
 * Uses tool-image color (#3b82f6 blue)
 */
export function ImageTools() {
  const availableTools = tools;

  return (
    <Layout title="Image Tools" showBack>
      <div className="p-4 space-y-6">
        {/* Category Header */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-tool-image/15 text-tool-image">
              <Image className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                Image Tools
              </h2>
              <p className="text-xs text-text-tertiary">
                {availableTools.length} tools available
              </p>
            </div>
          </div>
        </section>

        {/* Ad Banner */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <AdBanner slot="tool-list" />
        </section>

        {/* Available Tools */}
        <section>
          <h2
            className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 animate-fade-in"
            style={{ animationDelay: '150ms' }}
          >
            Available
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {availableTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} to={`/image/${tool.id}`}>
                  <Card
                    variant="interactive"
                    category="image"
                    className={cn(
                      'h-full animate-card-reveal opacity-0',
                      'group overflow-hidden'
                    )}
                    style={{ animationDelay: `${200 + index * 60}ms` }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardContent className="p-4 flex flex-col items-center text-center relative">
                      {/* Icon container */}
                      <div
                        className={cn(
                          'p-3.5 rounded-2xl mb-3',
                          'bg-tool-image/10 text-tool-image',
                          'transition-all duration-300',
                          'group-hover:scale-110 group-hover:bg-tool-image/15'
                        )}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm text-text-primary mb-0.5 tracking-tight">
                        {tool.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-text-tertiary leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Arrow indicator */}
                      <ChevronRight
                        className={cn(
                          'absolute right-3 top-1/2 -translate-y-1/2',
                          'h-4 w-4 text-text-tertiary opacity-0',
                          'group-hover:opacity-100 group-hover:translate-x-0.5',
                          'transition-all duration-200'
                        )}
                      />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom padding */}
        <div className="h-2" />
      </div>
    </Layout>
  );
}
