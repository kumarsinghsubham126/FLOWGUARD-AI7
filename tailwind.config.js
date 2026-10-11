/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: "#05070B",
          card: "rgba(11, 17, 26, 0.75)",
          surface: "#0B111A",
        },
        cyan: {
          electric: "#00F0FF",
          dim: "rgba(0, 240, 255, 0.2)",
        },
        violet: {
          ai: "#8B5CF6",
          glow: "rgba(139, 92, 246, 0.3)",
        },
        mint: {
          healthy: "#10B981",
        },
        amber: {
          warning: "#F59E0B",
        },
        coral: {
          critical: "#EF4444",
        },
        aws: {
          orange: "#FF9900",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace', 'ui-monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'spin 20s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
