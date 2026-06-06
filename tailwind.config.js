/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#050505",
          bg: "#080808",
          card: "#121212",
          border: "#1C1C1E",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        neon: {
          green: "#39FF14",
          lime: "#CCFF00",
          red: "#FF3131",
          gold: "#FFD700"
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glass-glow': 'radial-gradient(circle at 50% 50%, rgba(57, 255, 20, 0.15), transparent 60%)',
        'glass-glow-red': 'radial-gradient(circle at 50% 50%, rgba(255, 49, 49, 0.15), transparent 60%)'
      }
    },
  },
  plugins: [],
}
