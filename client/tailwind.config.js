/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#6080a6',
          600: '#486581',
          700: '#3e4c66',
          800: '#2a3f5f',
          900: '#1a2740',
          950: '#0f1a2e',
        },
        teal: {
          50: '#effcf6',
          100: '#c7f7e9',
          200: '#90edda',
          300: '#51d9c8',
          400: '#2bc3b5',
          500: '#16a597',
          600: '#0d8579',
          700: '#0a6961',
          800: '#0a5650',
          900: '#094844',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
