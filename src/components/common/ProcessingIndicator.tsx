import { cn } from '@/lib/utils';
import type { CardCategory } from '@/components/ui/card';

interface ProcessingIndicatorProps {
  progress?: number;
  message?: string;
  className?: string;
  /** Tool category for themed colors */
  category?: CardCategory;
  /** Show completion burst when progress reaches 100 */
  showCompletionBurst?: boolean;
}

// Category color mappings
const categoryColors: Record<NonNullable<CardCategory>, { from: string; to: string; glow: string }> = {
  image: { from: '#3b82f6', to: '#60a5fa', glow: 'rgba(59,130,246,0.3)' },
  pdf: { from: '#ef4444', to: '#f87171', glow: 'rgba(239,68,68,0.3)' },
  text: { from: '#22c55e', to: '#4ade80', glow: 'rgba(34,197,94,0.3)' },
  media: { from: '#a855f7', to: '#c084fc', glow: 'rgba(168,85,247,0.3)' },
};

const defaultColors = { from: '#3378ff', to: '#599dff', glow: 'rgba(51,120,255,0.3)' };

/**
 * Circular progress ring with gradient
 */
function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  category,
  className,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  category?: CardCategory;
  className?: string;
}) {
  const colors = category ? categoryColors[category] : defaultColors;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const gradientId = `progress-gradient-${category || 'default'}`;

  return (
    <svg
      width={size}
      height={size}
      className={cn('transform -rotate-90', className)}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Processing: ${Math.round(progress)}%`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
      </defs>
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="none"
        className="text-border opacity-30"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientId})`}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-300 ease-out"
        style={{
          filter: `drop-shadow(0 0 8px ${colors.glow})`,
        }}
      />
    </svg>
  );
}

/**
 * Indeterminate spinner for unknown progress
 */
function GradientSpinner({
  className,
  category,
}: {
  className?: string;
  category?: CardCategory;
}) {
  const colors = category ? categoryColors[category] : defaultColors;
  const gradientId = `spinner-gradient-${category || 'default'}`;

  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="50%" stopColor={colors.to} />
          <stop offset="100%" stopColor={colors.from} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-10"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="80, 200"
        strokeDashoffset="0"
        style={{
          filter: `drop-shadow(0 0 6px ${colors.glow})`,
        }}
      />
    </svg>
  );
}

/**
 * Processing indicator with Precision Tools styling
 * Features: circular progress ring, category theming, completion burst
 */
export function ProcessingIndicator({
  progress,
  message = 'Processing...',
  className,
  category,
  showCompletionBurst = true,
}: ProcessingIndicatorProps) {
  const hasProgress = progress !== undefined && progress >= 0;
  const isComplete = progress !== undefined && progress >= 100;
  const colors = category ? categoryColors[category] : defaultColors;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-5 py-10',
        'animate-fade-in',
        className
      )}
    >
      {/* Progress ring or spinner with percentage overlay */}
      <div className="relative">
        {/* Completion burst effect */}
        {isComplete && showCompletionBurst && (
          <div
            className="absolute inset-0 animate-success-pulse rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Progress ring or indeterminate spinner */}
        {hasProgress ? (
          <ProgressRing progress={progress} size={72} strokeWidth={5} category={category} />
        ) : (
          <GradientSpinner className="h-[72px] w-[72px]" category={category} />
        )}

        {/* Percentage in center */}
        {hasProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'text-base font-bold font-mono tabular-nums',
                'transition-colors duration-200',
                isComplete ? 'text-success' : 'text-text-primary'
              )}
            >
              {isComplete ? '✓' : `${Math.round(progress)}%`}
            </span>
          </div>
        )}
      </div>

      {/* Message */}
      <p
        aria-live="polite"
        className={cn(
          'text-sm font-medium tracking-tight',
          'transition-colors duration-200',
          isComplete ? 'text-success' : 'text-text-secondary'
        )}
      >
        {isComplete ? 'Complete!' : message}
      </p>

      {/* Progress bar with shimmer effect */}
      {hasProgress && !isComplete && (
        <div className="w-56 space-y-2">
          {/* Track */}
          <div
            className={cn(
              'h-1.5 rounded-full overflow-hidden',
              'bg-surface-elevated border border-border/30'
            )}
          >
            {/* Fill with shimmer */}
            <div
              className={cn(
                'h-full rounded-full',
                'transition-all duration-300 ease-out',
                'relative overflow-hidden'
              )}
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                boxShadow: `0 0 12px ${colors.glow}`,
              }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>

          {/* Progress text */}
          <div className="flex justify-between text-xs text-text-tertiary font-mono tabular-nums">
            <span className="opacity-60">Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact processing spinner for inline use
 */
export function CompactSpinner({
  size = 'md',
  category,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  category?: CardCategory;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <GradientSpinner
      className={cn(sizeClasses[size], className)}
      category={category}
    />
  );
}

