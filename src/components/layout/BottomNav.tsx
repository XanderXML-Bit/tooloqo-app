import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Image, FileText, Film, Type, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home', color: 'primary' },
  { to: '/image', icon: Image, label: 'Image', color: 'image' },
  { to: '/pdf', icon: FileText, label: 'PDF', color: 'pdf' },
  { to: '/media', icon: Film, label: 'Media', color: 'media' },
  { to: '/text', icon: Type, label: 'Text', color: 'text' },
] as const;

type NavColor = (typeof navItems)[number]['color'];

// Both themes use shades that keep the 10px active label at 4.5:1 or more on its tinted pill,
// measured against the painted nav (glass gradient plus pill), not the page colour.
const colorClasses: Record<NavColor, { active: string; glow: string }> = {
  primary: {
    active: 'text-primary-700 dark:text-primary-400 bg-primary-500/10',
    glow: 'shadow-[0_0_12px_rgba(51,120,255,0.3)]',
  },
  image: {
    active: 'text-blue-700 dark:text-blue-400 bg-tool-image/10',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
  },
  pdf: {
    active: 'text-red-700 dark:text-red-400 bg-tool-pdf/10',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  },
  media: {
    active: 'text-purple-700 dark:text-purple-400 bg-tool-media/10',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
  },
  text: {
    active: 'text-green-800 dark:text-tool-text bg-tool-text/10',
    glow: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]',
  },
};

const indicatorColors: Record<NavColor, string> = {
  primary: 'from-primary-400 to-primary-600',
  image: 'from-blue-400 to-blue-600',
  pdf: 'from-red-400 to-red-600',
  media: 'from-purple-400 to-purple-600',
  text: 'from-green-400 to-green-600',
};

/**
 * Bottom navigation with Precision Tools styling
 * Features: category-aware colors, morphing indicator, spring animations
 */
export const BottomNav = memo(function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'safe-area-bottom',
        'border-t border-border/50',
        'glass'
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                'px-4 py-2 min-w-[60px] rounded-xl',
                'transition-all duration-300',
                '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                isActive
                  ? colorClasses[color].active
                  : 'text-text-tertiary hover:text-text-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Top indicator pill with category color */}
                <div
                  className={cn(
                    'absolute top-0.5 left-1/2 -translate-x-1/2',
                    'w-8 h-1 rounded-full',
                    'bg-gradient-to-r',
                    indicatorColors[color],
                    'transition-all duration-300',
                    '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                    isActive
                      ? 'opacity-100 scale-x-100'
                      : 'opacity-0 scale-x-0'
                  )}
                />

                {/* Icon with scale animation */}
                <div
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-300',
                    '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                    isActive && colorClasses[color].glow
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                      isActive && 'stroke-[2.5] scale-110'
                    )}
                  />
                </div>

                {/* Label with weight transition */}
                <span
                  className={cn(
                    'text-[10px] transition-all duration-200',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
});
