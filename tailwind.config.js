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
        'tera-bg': '#000000',
        'tera-panel': '#ffffff',
        'tera-muted': '#f5f5f5',
        'tera-border': 'rgba(0, 0, 0, 0.1)',
        'tera-accent': '#000000'
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

