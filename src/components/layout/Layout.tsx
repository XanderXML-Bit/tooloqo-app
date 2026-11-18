import { useMemo, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { SiteFooter } from './SiteFooter';
import { SkipLink, MAIN_CONTENT_ID } from './SkipLink';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showNav?: boolean;
}

type CategoryColor = 'primary' | 'image' | 'pdf' | 'media' | 'text';

/**
 * Get category color based on current route
 */
function getCategoryFromPath(pathname: string): CategoryColor {
  if (pathname.startsWith('/image')) return 'image';
  if (pathname.startsWith('/pdf')) return 'pdf';
  if (pathname.startsWith('/media')) return 'media';
  if (pathname.startsWith('/text')) return 'text';
  return 'primary';
}

const gridPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
};

const ambientGlowColors: Record<CategoryColor, string> = {
  primary: 'rgba(51, 120, 255, 0.12)',
  image: 'rgba(59, 130, 246, 0.12)',
  pdf: 'rgba(239, 68, 68, 0.1)',
  media: 'rgba(168, 85, 247, 0.1)',
  text: 'rgba(34, 197, 94, 0.1)',
};

/**
 * Main layout wrapper with Precision Tools styling
 * Features: category-aware ambient glow, noise texture, proper safe areas
 */
export function Layout({
  children,
  title,
  showBack = false,
  showNav = true,
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);

  const primaryGlowStyle = useMemo(() => ({
    background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${ambientGlowColors[category]}, transparent)`,
  }), [category]);

  const secondaryGlowStyle = useMemo(() => ({
    background: `radial-gradient(circle at 100% 100%, ${ambientGlowColors[category]}, transparent 70%)`,
  }), [category]);

  return (
    <div
      className={cn(
        'h-screen h-dvh flex flex-col bg-background relative overflow-hidden',
        // Stop the scroll area at the top edge of the fixed tab bar (h-16, 1px border and its
        // safe-area padding), so no button or result can sit under the bar.
        showNav && 'pb-[calc(4rem+1px+max(var(--safe-bottom),12px))]'
      )}
    >
      <SkipLink />

      {/* Primary ambient glow - top center */}
      <div
        className="absolute inset-x-0 top-0 h-[500px] pointer-events-none transition-colors duration-500"
        style={primaryGlowStyle}
      />

      {/* Secondary ambient glow - bottom right (subtle) */}
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-50"
        style={secondaryGlowStyle}
      />

      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 pointer-events-none noise-overlay" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={gridPatternStyle}
      />

      <Header
        title={title}
        showBack={showBack}
        onBack={showBack ? () => navigate(-1) : undefined}
      />

      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={cn(
          'flex-1 min-h-0 relative z-10 overflow-y-auto focus:outline-none',
          showNav && 'pb-4'
        )}
      >
        {/* Page content with entrance animation */}
        <div className="animate-page-enter mx-auto w-full max-w-2xl">{children}</div>
        <SiteFooter />
      </main>

      {showNav && <BottomNav />}
    </div>
  );
}
