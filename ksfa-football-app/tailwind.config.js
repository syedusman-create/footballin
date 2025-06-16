/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pitch': {
          DEFAULT: '#2c5530',
          dark: '#1a331d',
        }
      }
    },
  },
  plugins: [],
}