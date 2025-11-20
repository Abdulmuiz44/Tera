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
        'tera-bg': '#020202',
        'tera-panel': '#0f0f0f',
        'tera-muted': '#161616',
        'tera-border': 'rgba(255, 255, 255, 0.07)',
        'tera-accent': '#f5f5f5'
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

