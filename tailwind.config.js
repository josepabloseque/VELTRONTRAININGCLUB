/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veltron: {
          bg: '#0A0C0B',
          card: '#121514',
          cardBorder: 'rgba(142, 140, 58, 0.35)',
          olive: {
            DEFAULT: '#8E8C3A',
            light: '#B5B04E',
            dark: '#3A3A1A',
            glow: 'rgba(142, 140, 58, 0.2)',
          },
          sunset: '#E09F3E',
          muted: '#71717A',
        },
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        barlow: ['"Barlow"', 'system-ui', 'sans-serif'],
        athletic: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"Barlow"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};