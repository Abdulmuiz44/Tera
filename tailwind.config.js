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
<<<<<<< HEAD
        'tera-bg': '#000000',
        'tera-panel': '#ffffff',
        'tera-muted': '#f5f5f5',
        'tera-border': 'rgba(0, 0, 0, 0.1)',
        'tera-accent': '#000000'
=======
        'tera-bg': 'var(--bg-tera-bg)',
        'tera-panel': 'var(--bg-tera-panel)',
        'tera-muted': 'var(--bg-tera-muted)',
        'tera-border': 'var(--border-tera)',
        'tera-neon': 'var(--text-tera-accent)',
        'tera-accent': '#f5f5f5' // Keep as static or move to var if needed
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft-lg': '0 30px 70px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  plugins: []
}

