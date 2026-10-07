/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nhs: {
          blue: '#005EB8',
          dark: '#003087',
          bg: '#F0F4F5',
          text: '#212B32',
          muted: '#4C6272',
          border: '#D8DDE0'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
