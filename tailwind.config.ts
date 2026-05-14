import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        axiom: {
          bg:          '#06060f',
          surface:     '#0d0d1f',
          panel:       '#0f0f22',
          border:      '#1a1a35',
          violet:      '#8b5cf6',
          'violet-dim':'#6d47c9',
          amber:       '#f59e0b',
          emerald:     '#10b981',
          danger:      '#ef4444',
          muted:       '#4a4a7a',
          text:        '#e2e8f0',
          subtle:      '#94a3b8',
        },
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'monospace'],
        sans: ['var(--font-geist-sans)', 'sans-serif'],
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.6)' },
          '70%':  { boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        'pulse-ring-red': {
          '0%':   { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.6)' },
          '70%':  { boxShadow: '0 0 6px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
        'slide-in': {
          from: { transform: 'translateY(-4px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
      animation: {
        'pulse-ring':     'pulse-ring 2s ease-out infinite',
        'pulse-ring-red': 'pulse-ring-red 1.5s ease-out infinite',
        'slide-in':       'slide-in 0.2s ease-out',
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
      },
      boxShadow: {
        'panel':        '0 0 0 1px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(139, 92, 246, 0.04)',
        'panel-hover':  '0 0 0 1px rgba(139, 92, 246, 0.2)',
        'glow-violet':  '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-emerald': '0 0 16px rgba(16, 185, 129, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
