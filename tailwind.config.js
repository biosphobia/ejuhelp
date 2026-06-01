/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          black: '#111827',
          red: '#dc2626',
          blue: '#2563eb',
          green: '#16a34a',
        },
      },
    },
  },
  plugins: [],
};
