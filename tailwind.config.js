/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'tera-bg': '#050505',
        'tera-panel': '#0b0b0b',
        'tera-muted': '#141414',
        'tera-neon': '#00d4aa'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'glow-md': '0 10px 40px rgba(0, 212, 170, 0.45)',
        'glow-sm': '0 4px 20px rgba(0, 212, 170, 0.35)'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 212, 170, 0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.45)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
}

