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
        'tera-accent': '#f5f5f5' // Keep as static or move to var if needed
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft-lg': '0 30px 70px rgba(0, 0, 0, 0.45)'
      }
    }
  },
  plugins: []
}

