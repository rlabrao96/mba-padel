import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#05132e',
        surface: '#0a1f44',
        'surface-2': '#0f2a5c',
        border: '#1a3a7a',
        primary: '#0066CC',
        'primary-bright': '#1a8cff',
        'text-dim': '#8fa8cc',
        gold: '#f0c040',
        'gold-dim': '#b8902a',
        silver: '#c0d0e0',
        bronze: '#cd7f32',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
