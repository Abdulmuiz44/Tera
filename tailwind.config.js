/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        'tera-elevated': 'var(--bg-tera-panel-strong)',
        'tera-muted': 'var(--bg-tera-muted)',
        'tera-highlight': 'var(--bg-tera-highlight)',
        'tera-border': 'var(--border-tera)',
        'tera-neon': 'var(--text-tera-accent)',
        'tera-primary': 'var(--text-tera-primary)',
        'tera-secondary': 'var(--text-tera-secondary)',
        'tera-accent': 'var(--text-tera-accent)',
        'tera-input': 'var(--bg-tera-input)'
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI Variable Display', 'Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft-lg': 'var(--shadow-tera-soft)',
        'panel': 'var(--shadow-tera-panel)',
        'glow-md': '0 18px 44px rgba(219, 188, 142, 0.16)'
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
