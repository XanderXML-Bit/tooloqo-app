import {
  Moon,
  Sun,
  Monitor,
  Shield,
  ChevronRight,
  Palette,
  Info,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/common/AdBanner';
import { TooloqoMark } from '@/components/layout/Header';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/config/constants';
import type { Theme } from '@/types';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/**
 * Settings page with Precision Tools styling
 * Features: refined sections, smooth transitions, cohesive design
 */
export function Settings() {
  const { theme, setTheme } = useSettingsStore();

  return (
    <Layout title="Settings" showBack showNav={false}>
      <div className="p-4 space-y-5">
        {/* Header */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
              <SettingsIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                Settings
              </h2>
              <p className="text-xs text-text-tertiary">
                Customize your experience
              </p>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <Card
          className="animate-card-reveal opacity-0"
          style={{ animationDelay: '100ms' }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 font-semibold tracking-tight">
              <Palette className="h-4 w-4 text-primary-500" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? 'default' : 'secondary'}
                  size="sm"
                  className={cn(
                    'flex-1 gap-2',
                    theme === value && 'shadow-glow-primary'
                  )}
                  onClick={() => setTheme(value)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ad Banner */}
        <section
          className="animate-fade-in opacity-0"
          style={{ animationDelay: '200ms' }}
        >
          <AdBanner slot="settings" />
        </section>

        {/* About Section */}
        <Card
          className="animate-card-reveal opacity-0"
          style={{ animationDelay: '250ms' }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 font-semibold tracking-tight">
              <Info className="h-4 w-4 text-primary-500" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Privacy */}
            <Link
              to="/privacy"
              className={cn(
                'flex items-center justify-between py-3 rounded-lg px-3 -mx-3',
                'text-sm text-text-secondary',
                'hover:bg-surface-highlight hover:text-text-primary',
                'transition-all duration-150 group'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-text-tertiary" />
                Privacy
              </span>
              <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-text-secondary transition-colors" />
            </Link>

            {/* Version info with brand mark */}
            <div className="pt-5 text-center border-t border-border/30 mt-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TooloqoMark className="h-5 w-5" />
                <span className="font-semibold text-text-primary tracking-tight">
                  Tooloqo
                </span>
              </div>
              <p className="text-xs text-text-tertiary font-mono tabular-nums">
                v{APP_VERSION}
              </p>
              <p className="text-xs text-text-tertiary mt-3">
                Made with care for your privacy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </Layout>
  );
}
