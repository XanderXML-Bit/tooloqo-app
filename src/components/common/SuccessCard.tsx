import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollIntoView } from '@/hooks/useScrollIntoView';

interface SuccessCardProps {
  /** Success icon */
  icon: LucideIcon;
  /** Main content (children) */
  children: ReactNode;
}

export function SuccessCard({ icon: Icon, children }: SuccessCardProps) {
  const ref = useScrollIntoView<HTMLDivElement>();
  return (
    <Card ref={ref} className="border-success/50 bg-success/5 animate-fade-in">
      <CardContent className="p-4 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success mb-2">
          <Icon className="h-5 w-5" />
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

interface SuccessMetricProps {
  /** Main value to display */
  value: string;
  /** Label below the value */
  label: string;
  /** Optional sublabel */
  sublabel?: string;
}

/** Pre-styled metric display for success cards */
export function SuccessMetric({ value, label, sublabel }: SuccessMetricProps) {
  return (
    <>
      <p className="text-3xl font-bold text-success font-mono tabular-nums">
        {value}
      </p>
      <p className="text-sm font-semibold text-text-primary mt-1">
        {label}
      </p>
      {sublabel && (
        <p className="text-xs text-text-tertiary mt-0.5 font-mono tabular-nums">
          {sublabel}
        </p>
      )}
    </>
  );
}

interface SuccessMessageProps {
  /** Success message text */
  message: string;
  /** Optional subtitle */
  subtitle?: string;
}

/** Simple success message display for success cards */
export function SuccessMessage({ message, subtitle }: SuccessMessageProps) {
  return (
    <>
      <p className="text-sm font-semibold text-text-primary">
        {message}
      </p>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-0.5">
          {subtitle}
        </p>
      )}
    </>
  );
}
