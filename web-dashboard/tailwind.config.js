/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          blue: '#1e3a8a',
          dark: '#0f172a',
          gold: '#fbbf24',
          light: '#f1f5f9'
        }
      }
    },
  },
  plugins: [],
}
