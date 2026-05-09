/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
      },
      colors: {
        gold: '#D4AF37',
        dark: '#0A0A0A',
        card: '#131313',
        border: '#222222',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}