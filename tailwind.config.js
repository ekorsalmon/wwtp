/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7EE',
        ink: '#211B2E',
        brand: {
          DEFAULT: '#5B4EE5',
          dark: '#4438C4',
        },
        sunshine: '#FFD667',
        mint: '#8FE3B0',
        lavender: '#C9BFFA',
        sky: '#9FD8F5',
        coral: '#FF6B5B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
