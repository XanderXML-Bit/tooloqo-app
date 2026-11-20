import { Check, Sparkles, XCircle, Zap, Heart, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooloqoMark } from '@/components/layout/Header';
import { useAdStore } from '@/stores/adStore';
import { cn } from '@/lib/utils';

const benefits = [
  { text: 'Remove all advertisements', icon: XCircle },
  { text: 'Cleaner, distraction-free interface', icon: Sparkles },
  { text: 'Support continued development', icon: Heart },
  { text: 'One-time purchase, yours forever', icon: Star },
];

/**
 * Ad-Free purchase page with Precision Tools styling
 * Single $2.99 purchase to remove all ads
 */
export function AdFree() {
  const { adFree, setAdFree, restorePurchase } = useAdStore();

  const handlePurchase = () => {
    // Local preview only; no payment is processed. See GitHub issue #2.
    setAdFree(true);
  };

  return (
    <Layout title="Go Ad-Free" showBack showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header with animated brand mark */}
        <section className="text-center py-8 animate-fade-in">
          <div className="flex justify-center mb-5">
            <div
              className={cn(
                'relative inline-flex items-center justify-center',
                'w-20 h-20 rounded-3xl',
                'bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600',
                'shadow-glow-accent',
                'animate-hero-reveal'
              )}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-white/10" />
              <Sparkles className="h-10 w-10 text-white relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1
            className="text-2xl font-bold text-gradient-accent tracking-tight animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            Enjoy Tooloqo Ad-Free
          </h1>
          <p
            className="text-sm text-text-secondary mt-2 animate-fade-in"
            style={{ animationDelay: '150ms' }}
          >
            One-time purchase. No subscriptions.
          </p>
        </section>

        {/* Main Purchase Card */}
        <Card
          variant={adFree ? 'default' : 'premium'}
          className={cn(
            'relative overflow-visible animate-card-reveal opacity-0',
            adFree && 'border-success/50 bg-success/5'
          )}
          style={{ animationDelay: '200ms' }}
        >
          {/* Purchased Badge */}
          {adFree && (
            <div
              className={cn(
                'absolute -top-3 left-1/2 -translate-x-1/2',
                'px-4 py-1.5 rounded-full',
                'bg-success text-white text-xs font-semibold',
                'flex items-center gap-1.5',
                'shadow-glow-success',
                'animate-bounce-in'
              )}
            >
              <Check className="h-3.5 w-3.5" />
              Purchased
            </div>
          )}

          <CardContent className="p-6 space-y-6">
            {/* Price */}
            <div className="text-center py-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-text-primary font-mono tracking-tight">
                  $2.99
                </span>
              </div>
              <span className="text-sm text-text-tertiary mt-1 block">
                one-time payment
              </span>
            </div>

            {/* Benefits List */}
            <ul className="space-y-3.5">
              {benefits.map((benefit, i) => {
                return (
                  <li
                    key={i}
                    className={cn(
                      'flex items-center gap-3 text-sm',
                      'animate-slide-up opacity-0'
                    )}
                    style={{ animationDelay: `${300 + i * 75}ms` }}
                  >
                    <div
                      className={cn(
                        'p-1.5 rounded-lg shrink-0',
                        adFree ? 'bg-success/10' : 'bg-accent-500/10'
                      )}
                    >
                      <Check
                        className={cn(
                          'h-4 w-4',
                          adFree ? 'text-success' : 'text-accent-500'
                        )}
                        strokeWidth={2}
                      />
                    </div>
                    <span className="text-text-secondary">{benefit.text}</span>
                  </li>
                );
              })}
            </ul>

            {/* Comparison (not purchased) */}
            {!adFree && (
              <div
                className={cn(
                  'pt-4 border-t border-border/30',
                  'animate-fade-in opacity-0'
                )}
                style={{ animationDelay: '550ms' }}
              >
                <p className="text-xs text-text-tertiary mb-2.5 font-medium uppercase tracking-wider">
                  Without ad-free
                </p>
                <div className="flex items-center gap-2.5 text-sm text-text-tertiary">
                  <div className="p-1 rounded bg-surface-highlight">
                    <XCircle className="h-3.5 w-3.5 opacity-50" />
                  </div>
                  Ads shown on every page
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              className={cn(
                'w-full mt-2',
                !adFree && 'animate-fade-in opacity-0'
              )}
              style={{ animationDelay: '600ms' }}
              variant={adFree ? 'secondary' : 'premium'}
              size="xl"
              onClick={handlePurchase}
              disabled={adFree}
            >
              {adFree ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Already Ad-Free
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Go Ad-Free for $2.99
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Purchase */}
        <section
          className="text-center pt-2 pb-6 animate-fade-in opacity-0"
          style={{ animationDelay: '700ms' }}
        >
          <Button
            variant="ghost"
            className="text-text-tertiary hover:text-text-secondary"
            onClick={() => restorePurchase()}
          >
            Restore Purchase
          </Button>
          <p className="text-xs text-text-tertiary mt-4 max-w-[280px] mx-auto leading-relaxed">
            Already purchased? Tap restore to recover your ad-free status.
          </p>
        </section>

        {/* Branding Footer */}
        <section
          className="text-center pb-4 animate-fade-in opacity-0"
          style={{ animationDelay: '800ms' }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <TooloqoMark className="h-4 w-4 opacity-50" />
            <span className="text-xs text-text-tertiary">
              Tooloqo • Privacy-first tools
            </span>
          </div>
        </section>
      </div>
    </Layout>
  );
}
