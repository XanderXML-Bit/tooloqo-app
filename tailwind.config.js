/** @type {import('tailwindcss').Config} */
// Moved from the Play CDN config in index.html to a build-time config (same Tailwind 3.4.17).
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Core backgrounds - refined hierarchy
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-highlight': 'var(--color-surface-highlight)',
        'surface-overlay': 'var(--color-surface-overlay)',

        // Primary (Blue)
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd8ff',
          300: '#8ec0ff',
          400: '#599dff',
          500: '#3378ff',
          600: '#1a5cf5',
          700: '#1449e1',
          800: '#173bb6',
          900: '#19358f',
          DEFAULT: '#3378ff',
        },

        // Accent (Gold - Premium)
        accent: {
          400: '#fcd34d',
          500: '#fbbf24',
          600: '#d97706',
          DEFAULT: '#fbbf24',
        },

        // Semantic
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          DEFAULT: '#22c55e',
        },
        warning: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          DEFAULT: '#f97316',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          DEFAULT: '#ef4444',
        },

        // Text
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          DEFAULT: 'var(--color-text-primary)',
        },

        // Border
        border: 'var(--color-border)',

        // Tool category colors
        'tool-image': '#3b82f6',
        'tool-pdf': '#ef4444',
        'tool-media': '#a855f7',
        'tool-text': '#22c55e',
      },

      // Default border colour is the theme token, so borders without an explicit colour (and
      // `border-border/NN`, which cannot take an alpha on a CSS-variable colour) stay subtle.
      borderColor: {
        DEFAULT: 'var(--color-border)',
      },

      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      boxShadow: {
        'glow-primary': '0 0 20px rgba(51, 120, 255, 0.3)',
        'glow-accent': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-image': '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-pdf': '0 0 20px rgba(239, 68, 68, 0.25)',
        'glow-media': '0 0 20px rgba(168, 85, 247, 0.25)',
        'glow-text': '0 0 20px rgba(34, 197, 94, 0.25)',
        'inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        'elevation-1': '0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'elevation-2': '0 2px 4px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.06)',
        'elevation-3': '0 4px 8px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.06)',
        'elevation-4': '0 8px 16px rgba(0,0,0,0.1), 0 12px 24px rgba(0,0,0,0.08)',
      },

      animation: {
        // Base animations
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',

        // Premium animations
        'page-enter': 'pageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spring-pop': 'springPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',

        // Card and reveal animations
        'card-reveal': 'cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'hero-reveal': 'heroReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'icon-float': 'iconFloat 2.5s ease-in-out infinite',

        // Success/feedback animations
        'success-pulse': 'successPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'draw-check': 'drawCheck 0.4s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',

        // Toast progress
        'toast-progress': 'toastProgress linear forwards',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Motion only (no opacity), so page content is visible on first paint (LCP).
        pageEnter: {
          '0%': { transform: 'translateY(12px)' },
          '100%': { transform: 'translateY(0)' },
        },
        springPop: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(51, 120, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(51, 120, 255, 0)' },
        },
        cardReveal: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        heroReveal: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        iconFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-3px) rotate(2deg)' },
          '75%': { transform: 'translateY(-3px) rotate(-2deg)' },
        },
        successPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        drawCheck: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastProgress: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
};
