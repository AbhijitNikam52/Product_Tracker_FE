/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ag: {
          black: '#0A0A0F',
          surface: '#12121A',
          border: '#1E1E2E',
          purple: '#7C3AED',
          violet: '#A855F7',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
          white: '#F8F8FF',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
