/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#071a16',
        moss: '#174f3d',
        mint: '#b8f5da',
        lime: '#d9f99d',
        sand: '#f5f1e8',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(7, 26, 22, 0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
