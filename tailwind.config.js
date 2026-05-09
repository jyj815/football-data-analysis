/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'bg-primary': '#0a1628',
        'bg-secondary': '#152238',
        'bg-tertiary': '#1e3054',
        'accent-green': '#00ff88',
        'accent-red': '#ff4757',
        'accent-yellow': '#ffd93d',
        'accent-purple': '#a855f7',
        'accent-blue': '#3b82f6',
        'text-primary': '#ffffff',
        'text-secondary': '#8b9dc3',
        'text-muted': '#5a6a8a',
      },
      fontFamily: {
        'sans': ['Noto Sans SC', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
