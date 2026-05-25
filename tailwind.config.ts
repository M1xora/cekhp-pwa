import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ─── Claymorphism Border-Radius Scale ──────────────────────────────────
      borderRadius: {
        'clay-sm':  '12px',
        'clay':     '16px',
        'clay-md':  '24px',
        'clay-lg':  '32px',
        'clay-xl':  '40px',
      },

      // ─── Claymorphism Box-Shadow Tokens ────────────────────────────────────
      boxShadow: {
        // Soft raised card shadow
        'clay':       '0 8px 20px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        // Elevated / hovered card shadow
        'clay-lg':    '0 16px 40px -8px rgba(0,0,0,0.18), 0 8px 16px -4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        // Pressed / active card shadow
        'clay-pressed': '0 2px 8px -2px rgba(0,0,0,0.15), inset 0 2px 4px rgba(0,0,0,0.08)',
        // Selected / highlighted card shadow
        'clay-selected': '0 8px 24px -4px rgba(139,92,246,0.35), 0 4px 8px -2px rgba(139,92,246,0.20), inset 0 1px 0 rgba(255,255,255,0.6)',
        // Subtle inner glow
        'clay-inner': 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.06)',
      },

      // ─── Claymorphism Colour Palette ────────────────────────────────────────
      colors: {
        // Primary — vibrant violet/purple
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',  // base
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Secondary — vibrant rose/pink
        secondary: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',  // base
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Accent — vibrant cyan/teal
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // base
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Sunny yellow / highlight
        sunny: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',  // base
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        // Success green
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // base
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Clay surface tones (for card backgrounds)
        clay: {
          white:   '#ffffff',
          light:   '#f8f7ff',  // very light violet tint
          soft:    '#f0edff',  // soft lavender background
          muted:   '#e8e0ff',  // muted lavender
          surface: '#fdf6ff',  // pinkish-white surface
        },
      },

      // ─── Font Scale ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },

      // ─── Animation / Transition tokens ───────────────────────────────────
      keyframes: {
        'spring-in': {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '60%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)',    animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%':      { transform: 'translateY(-6px)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spring-in':   'spring-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'fade-in':     'fade-in 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
