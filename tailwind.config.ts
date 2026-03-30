import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        'hdpm-dark': '#2c4a29',
        'hdpm-green': '#6bab39',
        surface: {
          deep: '#0b0a1a',
          base: '#100f24',
          card: 'rgba(22, 20, 50, 0.6)',
          elevated: 'rgba(30, 28, 60, 0.7)',
        },
        ink: {
          primary: '#eeedf5',
          secondary: '#9d99b8',
          muted: '#5f5b7a',
        },
        neon: {
          green: '#6bab39',
          lime: '#a3f54c',
          cyan: '#22d3ee',
          purple: '#a78bfa',
          magenta: '#f472b6',
          orange: '#fb923c',
        },
        status: {
          green: '#34d399',
          yellow: '#fbbf24',
          red: '#f87171',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(107, 171, 57, 0.3), 0 0 60px rgba(107, 171, 57, 0.1)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)',
        'neon-purple': '0 0 20px rgba(167, 139, 250, 0.3), 0 0 60px rgba(167, 139, 250, 0.1)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', filter: 'blur(4px)' },
          to: { opacity: '1', filter: 'blur(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

export default config
