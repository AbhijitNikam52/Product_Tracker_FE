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
          black: '#080C14',
          surface: '#0F1626',
          border: '#1E293B',
          purple: '#4F46E5',
          violet: '#0D9488',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
          white: '#F9FAFB',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
