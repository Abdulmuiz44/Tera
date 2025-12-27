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
        'tera-bg': 'var(--bg-tera-bg)',
        'tera-panel': 'var(--bg-tera-panel)',
        'tera-muted': 'var(--bg-tera-muted)',
        'tera-border': 'var(--border-tera)',
        'tera-neon': 'var(--text-tera-accent)',
        'tera-primary': 'var(--text-tera-primary)',
        'tera-secondary': 'var(--text-tera-secondary)',
        'tera-accent': 'var(--text-tera-accent)',
        'tera-input': 'var(--bg-tera-input)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft-lg': '0 30px 70px rgba(0, 0, 0, 0.1)',
        'glow-md': '0 0 20px rgba(0, 255, 170, 0.2)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      transitionDelay: {
        '1000': '1000ms'
      }
    }
  },
  plugins: []
}

